FROM       ruby:2.3
MAINTAINER Julian Ospald <hasufell@posteo.de>


ENV EXECJS_RUNTIME=RubyRacer
ENV LC_ALL=C.UTF-8

COPY . /data
WORKDIR /data
RUN bundle install

EXPOSE 3000

RUN echo "#!/bin/sh\nset -e\ncd /data\nbundle install\nbundle exec nanoc compile\nbundle exec nanoc view" > /start.sh && \
	chmod +x /start.sh

CMD [ "/start.sh" ]
