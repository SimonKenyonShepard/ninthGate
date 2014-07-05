NinthGate
==========

## Starting your own peer server on Heroku

### Usage


sign up to Heroku for free

```bash
$ git clone https://github.com/SimonKenyonShepard/ninthGate.git
$ cd ninthGate
$ heroku login
$ heroku create ninthGate
$ heroku labs:enable websockets
$ git push heroku master
