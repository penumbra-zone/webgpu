import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

// Sample UTXO note
export const spendable_note = SpendableNoteRecord.fromJson({
    noteCommitment: {
        inner: "MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU="
    },
    note: {
        value: {
            amount: {
                lo: "1000000",
                hi: "0"
            },
            assetId: {
                inner: "nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=",
                altBech32m: "",
                altBaseDenom: ""
            }
        },
        rseed: "p2w4O1ognDJtKVqhHK2qsUbV+1AEM/gn58uWYQ5v3sM=",
        address: {
            inner: "F6T1P51M1QOu8NGhKTMdJTy72TDhB2h00uvlIUcXVdovybq4ZcOwROB+1VE/ar4thEDNPanAcaYOrL+FugN8e19pvr93ZqmTjUdOLic+w+U=",
            altBech32m: ""
        }
    },
    addressIndex: {
        account: 0,
        randomizer: "AAAAAAAAAAAAAAAA"
    },
    nullifier: {
        inner: "8TvyFVKk16PHcOEAgl0QV4/92xdVpLdXI+zP87lBrQ8="
    },
    heightCreated: "250305",
    heightSpent: "0",
    position: "3204061134848",
    source: {
        inner: "oJ9Bo9v22srtUmKdTAMVwPOuGumWE2cAuBbZHci8B1I="
    }
});
