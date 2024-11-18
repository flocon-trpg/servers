import { graphql } from '../graphql-codegen';

export const GetServerInfoDoc = graphql(`
    query GetServerInfo {
        result: getServerInfo {
            version {
                major
                minor
                patch
                prerelease {
                    type
                    version
                }
            }
            uploaderEnabled
        }
    }
`);
