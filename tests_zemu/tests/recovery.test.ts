/** ******************************************************************************
 *  (c) 2020 Zondax GmbH
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import Zemu, { DEFAULT_START_OPTIONS } from '@zondax/zemu'
import { newKaruraApp } from '@zondax/ledger-substrate'
import { APP_SEED, models } from './common'

const defaultOptions = {
  ...DEFAULT_START_OPTIONS,
  logging: true,
  custom: `-s "${APP_SEED}"`,
  X11: false,
}

jest.setTimeout(60000)

beforeAll(async () => {
  await Zemu.checkAndPullImage()
})

async function activateSecretMode(sim: any) {
  // Get to Zondax.ch menu
  for (let i = 0; i < 3; i += 1) {
    await sim.clickRight()
  }

  // Activate secret features
  for (let i = 0; i < 10; i += 1) {
    await sim.clickBoth()
  }

  const reviewSteps = sim.startOptions.model === 'nanos' ? 7 : 6

  // Review warning message
  for (let i = 0; i < reviewSteps; i += 1) {
    await sim.clickRight()
  }

  // Accept
  await sim.clickBoth()
}

describe('Standard', function () {
  test.skip.each(models)('main secret menu (%s)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = newKaruraApp(sim.getTransport())

      const karura_expected_address = 'sCFFBRb4EXvazWmoBieJWpeqKLQVJpc9BDfLKa2tLfsrxdT'
      const karura_expected_pk = 'ac5752c2c18bcbb882a938df5b8ccee7be8d2f332a1496c841eb695bf6ebb30a'
      const polkadot_expected_address = 'tQDZeEdweFTqaqLFvdAeVou6Q9wzw51zRyAAmuusf8tHB3T'
      const polkadot_expected_pk = 'e1b4d72d27b3e91b9b6116555b4ea17138ddc12ca7cdbab30e2e0509bd848419'

      let resp = await app.getAddress(0x80000000, 0x80000000, 0x80000000)
      console.log(resp)
      expect(resp.address).toEqual(karura_expected_address)
      expect(resp.pubKey).toEqual(karura_expected_pk)

      await activateSecretMode(sim)

      resp = await app.getAddress(0x80000000, 0x80000000, 0x80000000)
      console.log(resp)
      expect(resp.address).toEqual(polkadot_expected_address)
      expect(resp.pubKey).toEqual(polkadot_expected_pk)
    } finally {
      await sim.close()
    }
  })
})