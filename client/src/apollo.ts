import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { readAuthToken } from './utils';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import introspection from './introspection.json';
import libraryContains from './fieldPolicies/libraryContains';

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_SERVER_HOST}/graphql`,
  headers: {
    get 'x-api-token'() {
      return readAuthToken();
    },
  },
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${import.meta.env.VITE_WEBSOCKET_HOST}/graphql`,
    connectionParams: {
      get apiToken() {
        return readAuthToken();
      },
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  ApolloLink.from([httpLink])
);

export default new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    possibleTypes: introspection.possibleTypes,
    typePolicies: {
      Album: {
        fields: {
          releaseDate: {
            merge: true,
          },
        },
      },
      Copyright: {
        keyFields: false,
      },
      CurrentUser: {
        keyFields: [],
        fields: {
          albumsContains: libraryContains(),
          episodesContains: libraryContains(),
          showsContains: libraryContains(),
          tracksContains: libraryContains(),
        },
      },
      Developer: {
        keyFields: [],
      },
      FieldConfig: {
        keyFields: ['schemaField', ['fieldName', 'typename']],
      },
      Followers: {
        keyFields: false,
      },
      Image: {
        keyFields: ['url'],
      },
      Player: {
        keyFields: [],
        fields: {
          playbackState: {
            merge: (existing, incoming, { cache, mergeObjects }) => {
              if (incoming === null) {
                cache.evict({
                  id: cache.identify({ __typename: 'PlaybackState' }),
                });
                cache.gc();

                return null;
              }

              return mergeObjects(existing, incoming);
            },
          },
        },
      },
      PlaybackState: {
        keyFields: [],
        merge: true,
      },
      Query: {
        fields: {
          me: {
            merge: true,
          },
        },
      },
      ReleaseDate: {
        keyFields: false,
      },
      SavedTrackEdge: {
        keyFields: [['node', ['id']]],
      },
    },
  }),
});
