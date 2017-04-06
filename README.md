## CBO Self Assessment Tool

In order to install and run:

1. Clone from GIT repo: `git clone https://github.com/havasnewyork/cbo-self-assessment.git`

2. Change to working directory: `cd cbo-self-assessment`

3. Install the node modules by running `npm install`

4. Create an .env file and add the following:

    * `mongo_uri=mongodb://localhost/cbo`

5. Make sure target mongo database is running

6. In Mongo DB shell run the commands in dbseed.txt file

7. Start the app: `node app`

8. Browse to `http://localhost:3000/en` or de,es,fr,ko etc...

9. To enable MRS for any language, set environment variable mrsLangs=en,de,fr for example

10. bluemix space  api-economy-self-assessment-73797
## TODO
