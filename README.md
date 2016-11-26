To test on a single machine, run:

```
docker run -d --name mongo -h ordersdb mongo mongod --rest
docker run -d --name tty-frontend -h frontend tty-frontend
docker run -d --name tty-logstash -h interface --link=mongo tty-logstash
docker run -d --name tty-haproxy --link=mongo --link=tty-logstash --link=tty-frontend -p 80:1080 tty-haproxy
```
