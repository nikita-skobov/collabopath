# setting up your backend

Almost everything is properly defined within the serverless.yml file. You just need to change the service name to your domain name, and then provide the proper command line arguments. I go over this [on the README inside the root of this repo](../README.md)

### If you want to use the serverless.yml setup, but you DO NOT have a domain, then you will need to modify a few things.

First, you will need to get rid of all references to cloudfront distributions, and S3 buckets so either comment out, or remove the following resource blocks:
```
    WebAppS3BucketPolicy:
      Type: AWS::S3::BucketPolicy
      # ... lots of other configuration stuff
    WebAppS3Bucket:
      Type: AWS::S3::Bucket
      # ... lots of other configuration stuff
    WebRedirectS3Bucket:
      Type: AWS::S3::Bucket
      # ... lots of other configuration stuff
    ApiCloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      # ... lots of other configuration stuff
    RedirectCloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      # ... lots of other configuration stuff
    WebAppCloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      # ... lots of other configuration stuff
```

You will need to remove the api key:
```
provider:
  name: aws
  runtime: nodejs8.10
  stage: ${opt:stage,'dev'}
  region: ${opt:region, 'us-east-1'}
  # apiKeys:
  # ... comment out the api keys
  endpointType: REGIONAL
  ## you can remove the endpointType if you want since REGIONAL was only necessary when using cloudfront distributions in front of the backend API.
```

And remove the private setting from all of your functions:
```
- http:
    path: /path/{id}
    method: GET
    # private: true
    cors: true
```

Next, inside of handler.js you'll want to change all CORS settings from this:
```
'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`,
```

to this:
```
'Access-Control-Allow-Origin': '*',
```

Also, you can remove/comment out the custom command line options that are no longer necessary:
```
  # useragentsecret: ${opt:uasecret}
  account: ${opt:account}
  # certid: ${opt:certid}
  # logbucket: ${opt:logbucket}
```

Once that has been done, you can run the following command to deploy:

```
# use whatever stage you want
serverless deploy --stage dev2 --account 862148744358
```

This will produce output that will contain the following:
```
api keys:
  None
endpoints:
  GET - https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/{id}
  POST - https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/vote
  POST - https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/suggestion
  POST - https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/add
```

You will use these endpoints inside of frontend/src/dynamicVars.js to link your frontend api calls, with your actual backend endpoints. Now change the dynamicVars.js file from this:
```
module.exports.getPathObjEndpoint = 'https://api.collabopath.com/path/'
module.exports.votePathObjEndpoint = 'https://api.collabopath.com/path/vote'
module.exports.addPathObjEndpoint = 'https://api.collabopath.com/path/add'
module.exports.suggestionEndpoint = 'https://api.collabopath.com/suggestion'
```

To this:
```
module.exports.getPathObjEndpoint = 'https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/'
module.exports.votePathObjEndpoint = 'https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/vote'
module.exports.addPathObjEndpoint = 'https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/path/add'
module.exports.suggestionEndpoint = 'https://3adsshlqj8.execute-api.us-east-1.amazonaws.com/dev2/suggestion'
```

now when you run your local dev server, you will be actually using YOUR backend api, and you can then add path objects to your database.

NOTE that before you will be able to add any path objects to your database, you will need to fill the database with some initial path objects. This is because the backend api does not allow you to add an object to path ID 'a1' if path ID 'a' does not already exist, and when you deploy your resources, your dynamoDB table is empty by default. I have provided a script inside the root of this directory to fill the database with some starting path objects. To run this script, simply go to the root of this repo, and run the following command:
```
# note that if you changed the service name in your serverless.yml file, you will also need to change the TABLE name in the command below:
TABLE=collabopath-dev2-pathobjects node uploadPathObjectScript.js
```
