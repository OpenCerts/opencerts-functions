# Email Function

This function sends email on behalf of OpenCerts user to another recipient.

This function is to be deployed to AWS lamba. 

# Development

Copy `.env` from a co-worker or insert own credentials to get started. A copy of the .env file is available at `.env.example`

```
yarn dev
```

# Styling Certificate

The templates for the email are located in the folder `/src/messageTemplate`. 

- template.txt (raw text template)
- template.html (html email template)
- template.subject (subject title template)

Please update the test files after updating the template files:

- expected.txt
- expected.html
- expected.subject

# Test

The test make use of ethereal email service. Upon running the test you may visit the preview url to see how your email will look like. 

```
yarn test
```

# Deployment

To deploy to AWS you will require the necessary AWS credentials.

```
yarn deploy
```