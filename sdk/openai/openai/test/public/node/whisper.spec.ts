// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Recorder } from "@azure-tools/test-recorder";
import { matrix } from "@azure/test-utils";
import { Context } from "mocha";
import { AuthMethod, createClient, startRecorder } from "../utils/recordedClient.js";
import { OpenAIClient } from "../../../src/index.js";
import { readFileSync } from "fs";
import { AudioResultFormat } from "../../../src/models/audio.js";
import {
  formDataPolicyName,
  formDataWithFileUploadPolicy,
} from "../../../src/api/policies/formDataPolicy.js";

function getModel(authMethod: AuthMethod): string {
  return authMethod === "OpenAIKey" ? "whisper-1" : "whisper-deployment";
}

describe.only("OpenAI", function () {
  matrix([["AzureAPIKey", "OpenAIKey"]] as const, async function (authMethod: AuthMethod) {
    describe(`[${authMethod}] Client`, () => {
      let recorder: Recorder;
      let client: OpenAIClient;

      beforeEach(async function (this: Context) {
        recorder = await startRecorder(this.currentTest);
        client = createClient(authMethod, { recorder });
        client["_client"].pipeline.removePolicy({ name: formDataPolicyName });
        client["_client"].pipeline.addPolicy(formDataWithFileUploadPolicy("6ceck6po4ai0tb2u"));
      });

      afterEach(async function () {
        if (recorder) {
          await recorder.stop();
        }
      });

      // To-do: add tests for ['webm', 'mp4', 'mpga', 'mpeg', 'oga']"
      matrix(
        [
          ["json", "verbose_json", "srt", "vtt", "text"],
          ["m4a", "mp3", "wav", "ogg", "flac"],
        ] as const,
        async function (format: AudioResultFormat, extension: string) {
          describe("getAudioTranscription", function () {
            it("returns transcription", async function () {
              const file = readFileSync(`./assets/audio/countdown.${extension}`);
              const res = await client.getAudioTranscription(getModel(authMethod), format, file);
              console.log(res);
            });
          });

          describe("getAudioTranslation", function () {
            it("returns translation", async function () {
              const file = readFileSync(`./assets/audio/countdown.${extension}`);
              const res = await client.getAudioTranslation(getModel(authMethod), format, file);
              console.log(res);
            });
          });
        }
      );
    });
  });
});
