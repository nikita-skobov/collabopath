# UPDATE 3/31/2019
The domain has been deleted. I don't receive enough traffic on the site to justify paying for the domain name. I will, however, keep the repository open.


# collabopath

The repo for https://collabopath.com

# installation

```
git clone https://github.com/nikita-skobov/collabopath.git
cd collabopath
```

## for setting up the frontend dev server

```
cd frontend
npm install
npm run build:server
```

NOTE that I am using eslint with the airbnb settings, and I have added a .eslintrc.js file which modifies some of the airbnb settings. this causes npm install to install a LOT of extra dependencies that you otherwise would not need. If you do not want to use eslint, please remove the following from the package.json file:

```
"eslint": "^5.7.0",
"eslint-config-airbnb": "^17.1.0",
"eslint-plugin-import": "^2.14.0",
"eslint-plugin-jsx-a11y": "^6.1.2",
"eslint-plugin-react": "^7.11.1",
```

Once that is done, you should be able to access the website running locally on localhost:8080

Please note that the website has the API endpoints hardcoded into the src/dynamicVars.js file, and they will NOT work from localhost because of CORS settings. So you will not be able to post new paths, or even get paths from the main database. If you are interested in setting up your own backend environment, you will need to have an AWS account (since all resources I've used are through AWS), and you can refer to the backend setup below.

## for setting up your backend environment

Almost all resources are defined within the serverless.yml file within the backend directory.
This file will create resources for this project automatically, and link most of them together. The only resources not defined in the serverless.yml file are your route53 records that you'll need to make.

### Requirements:
- An AWS account with admin permissions
- serverless installed [see here](https://serverless.com/framework/docs/getting-started/)
- If you want to use the configuration file as is, you will need a domain, and an certificate provided from ACM (amazon certificate manager), otherwise, please take a look at [the documentation inside the backend directory](./backend/README.md), for modifying the backend setup to not use a domain

First:

```
cd backend
npm install
```

Next, you will need to modify the serverless config file with your own domain name:

```
service: collabopath # NOTE: update this with your service name
provider:
  name: aws
  runtime: nodejs8.10
  stage: ${opt:stage,'dev'}
  region: ${opt:region, 'us-east-1'}
```

Change collabopath to whatever domain you would like to use (if you are using example.com, set the service to be example)

NOTE that if your domain does not end in .com, you will have to look for all references of .com in that file, and change them to your proper TLD extension. For example:

```
    CustomOriginConfig:
      HTTPPort: 80
      HTTPSPort: 443
      OriginProtocolPolicy: https-only
Enabled: 'true'
Aliases:
  - "api.${self:service}.com" # <- change .com to your TLD
```

Also, you'll need to modify the handler.js file:

```
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  }
  // change the .com after ${process.env.DOMAIN} to your TLD
```

Now you should be ready to deploy. Once again, you will need to have serverless installed, and have an AWS account, with a user credentials that have admin privileges. These credentials are typically stored in a folder called .aws/ and the file name is credentials with no extension. serverless looks for your credentials in this file. If it gives you some kind of error in regards to those credentials, you can follow [this guide](https://serverless.com/framework/docs/providers/aws/guide/credentials/) to see the different ways to set up serverless to use your AWS credentials.

To deploy, you also need to pass a few command line arguments. These are located at the top of the custom section of serverless.yml:

```
  useragentsecret: ${opt:uasecret}
  account: ${opt:account}
  certid: ${opt:certid}
  logbucket: ${opt:logbucket}
```

Useragentsecret is a header passed from a cloudfront distribution to an s3 bucket. the s3 bucket will only allow getobject requests if they contain that header. This is security by obfuscration, and isn't a very good method of protecting your S3 bucket, but it's simple to setup, so that's why I chose it. In larger/more important projects, you'll want to find a different way of protecting your S3 bucket.

Account is your AWS account id. it looks something like: 862148744358 and is included in almost all resources that you create. for example if you create a dynamodb table, you can look at the table overview, and at the bottom you'll see your ARN which will look something like: `arn:aws:dynamodb:us-east-1:862148744358:table/my-table-name`

certid is the id of the ACM certificate you are using for your domain. After you create a certificate, and it has a status of Issued, you can find its ARN in the details section of the ACM console (or via the AWS CLI if you know which command to use). The ARN looks something like this `arn:aws:acm:us-east-1:862148744358:certificate/296a25dd-18c7-2bcf-9726-2b821c472cfc`
but when you pass the certid command line argument, you only need to specify this part: `296a25dd-18c7-2bcf-9726-2b821c472cfc`

logbucket is the name of a bucket you want to use for cloudfront logging. If you do not want to use cloudfront logging, look through the serverless config file, and remove, or comment out everything that looks like this:

```
Logging:
  IncludeCookies: 'false'
  Bucket: ${self:custom.logbucket}
  Prefix: "api-${self:provider.stage}-${self:service}"
```

So here is an example of a serverless deploy command using some of the above arguments:

```
# sls is an alias for serverless
sls deploy --stage dev --uasecret blabblab123 --account 862148744358 --certid 296a25dd-18c7-2bcf-9726-2b821c472cfc --logbucket cloudfront-logging-bucket.s3.amazonaws.com
```
This will take a long time because it creates cloudfront distributions, and it won't finish the command until the cloudfront distributions have a status of deployed.

NOTE: after you run this command, serverless will give you your api key as an output. You will then have to change the following in your serverless.yml file:
```
HeaderValue: someapikey #THIS NEEDS TO BE CHANGED
```
To the apikey that serverless generated. Once you have changed that, run the same deploy command again. It will still take a long time because it is modifying a cloudfront distribution, but not as long as creating a cloudfront distribution.

About halfway through, the distributions should be live on most endpoints, and you can finish your deployment by adding route53 records, and putting the static files into the S3 bucket.

To add the proper route53 records, go to your hosted zone for the domain you used, and add 3 records: YOURDOMAIN.com as a type A record with an alias. The alias is the domain of the cloudfront distribution that was created for your main website entry. if you click in the Alias Target box and scroll down, you should see your cloudfront distribution show up. Do the same for www.YOURDOMAIN.com, and api.YOURDOMAIN.com.


# Deployment

There are a couple things you need to do for deployment.
First, make sure to add the initial path objects to your database once it has been created. otherwise, the backend api will not allow you to create path objects. This is because the backend api makes sure that you can only add a path object if the previous path ID exists. example: you cannot add a path object with ID 000 if a path object with IF 00 does not already exist. To fill the database with the initial objects I have provided a script in the root of this repo. run it as follows: (dev2 is the stage, if you used a different stage, substitute dev2 with your stage name)
```
# note that if you changed the service name in your serverless.yml file, you will also need to change the TABLE name in the command below:
TABLE=collabopath-dev2-pathobjects node uploadPathObjectScript.js
```

Next, you will want to add your distribution files to your S3 bucket (make sure it is the root bucket, not the redirect bucket!)

This step is only necessary if you are trying to deploy the website on the internet. You obviously do not need to do this if you want to run everything on localhost.

first run:
```
npm run build
```

which will minify, and bundle your js files, and put them in frontend/dist/scripts
It also adds a index.html file inside frontend/dist which has the names of the scripts automatically in it.

Next, simply go to your S3 bucket, and upload everything inside the dist folder.

Remember to set a cache control max-age if you are using a cloudfront distribution. Otherwise cloudfront caches your objects for the default duration which is a very long time. If you made a mistake and modify one of your files, it will still be in cloudfront's cache and you won't be able to see your fixed changes.

# TODO
Add more documentation explaining the frontend components... some of them are really messy, and poorly documented.
