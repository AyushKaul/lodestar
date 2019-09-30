import {describeDirectorySpecTest, InputType} from "@chainsafe/eth2.0-spec-test-util/lib/single";
import {AttestationData, Hash} from "@chainsafe/eth2.0-types";
import {config} from "@chainsafe/eth2.0-config/lib/presets/minimal";
import {expect} from "chai";
import {IBaseSSZStaticTestCase} from "../../type";
import {hashTreeRoot, serialize} from "../../../../src";
import {TEST_CASE_LOCATION} from "../../../util/testCases";

interface IResult {
  root: Hash;
  serialized: Buffer;
}

["ssz_lengthy", "ssz_max", "ssz_nil", "ssz_one", "ssz_random", "ssz_random_chaos", "ssz_zero"].forEach((caseName) => {

  describeDirectorySpecTest<IBaseSSZStaticTestCase<AttestationData>, IResult>(
    `attestation data ${caseName} minimal`,
    `${TEST_CASE_LOCATION}/tests/minimal/phase0/ssz_static/AttestationData/${caseName}`,
    (testcase) => {
      const serialized = serialize(testcase.serialized, config.types.AttestationData);
      const root = hashTreeRoot(testcase.serialized, config.types.AttestationData);
      return {
        serialized,
        root
      };
    },
    {
      // @ts-ignore
      inputTypes: {
        roots: InputType.YAML,
        serialized: InputType.SSZ
      },
      // @ts-ignore
      sszTypes: {
        serialized: config.types.AttestationData,
      },
      getExpected: (testCase => {
        return {
          root: Buffer.from(testCase.roots.root.replace("0x", ""), "hex"),
          // @ts-ignore
          serialized: testCase.serialized_raw
        };
      }),
      expectFunc: (testCase, expected, actual) => {
        expect(expected.serialized.equals(actual.serialized)).to.be.true;
        expect(expected.root.equals(actual.root)).to.be.true;
      },
      unsafeInput: true,
    }
  );

});
