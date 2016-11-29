To test on a single machine, run:

```
docker run -d --name mongo -h ordersdb mongo mongod --rest
docker run -d --name rabbitmq --hostname orderupdatequeue rabbitmq
docker run -d --name tty-frontend -h frontend tty-frontend
docker run -d --name tty-logstash-enqueue -e "LOGSTASH_MODE=enqueue" -h interface --link=rabbitmq tty-logstash
docker run -d --name tty-logstash-persist -e "LOGSTASH_MODE=persist" --link=rabbitmq --link=mongo tty-logstash
docker run -d --name tty-querycache -h backend --link=mongo tty-querycache
docker run -d --name tty-haproxy --link=tty-querycache --link=tty-logstash-enqueue --link=tty-frontend -p 80:1080 tty-haproxy
```
