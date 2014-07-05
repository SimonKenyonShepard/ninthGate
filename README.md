NinthGate
==========

## Starting your own peer server on Heroku

### Usage


sign up to Heroku for free (https://id.heroku.com/signup)

```bash
$ git clone https://github.com/SimonKenyonShepard/ninthGate.git
$ cd ninthGate
$ heroku login
$ heroku create ninthGate
$ heroku labs:enable websockets
$ git push heroku master

## updating github pages

### Usage

run grunt to create a build and then create a post hook for your github repo to deploy it

```bash
$ git clone https://github.com/SimonKenyonShepard/ninthGate.git
$ cd ninthGate
$ grunt build-gh-pages

When you have your build directory, add this to .git/hooks/post-commit

$ #!/bin/sh
$ git push -f origin master:gh-pages
$ git checkout gh-pages
$ 

Remember to change the permissions of the bash script.

$chmod +x .git/hooks/post-commit