import {test} from 'node:test';
import assert from 'node:assert/strict';
import {databaseOptions} from '../netlify/functions/_shared/database';
test('Neon configuration requires TLS and production scope; existing deployment remains usable until configured',()=>{
 assert.equal(databaseOptions({}),undefined);
 const url='postgresql://user:placeholder@ep-example-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
 assert.equal(databaseOptions({PHARMATAP_DATABASE_PROVIDER:'neon',DATABASE_URL:url,CONTEXT:'production'})?.connectionString,url);
 for(const env of [{},{DATABASE_URL:url,CONTEXT:'deploy-preview'},{DATABASE_URL:url.replace('sslmode=require','sslmode=disable')},{DATABASE_URL:url.replace('.neon.tech','.example.com')}])assert.throws(()=>databaseOptions({PHARMATAP_DATABASE_PROVIDER:'neon',...env}));
});
