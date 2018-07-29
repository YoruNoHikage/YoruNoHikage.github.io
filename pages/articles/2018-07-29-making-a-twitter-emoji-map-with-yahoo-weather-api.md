---
title: "Making a Twitter emoji map with Yahoo Weather API"
date: "2018-07-29T23:14:32.515Z"
layout: draft
path: "/2018/07/29/making-a-twitter-emoji-map-with-yahoo-weather-api"
categories:
- Development
---
A few days ago, a friend sent me a tweet showing a map of France made of emojis representing the weather in each part of the country. I found the idea to be nice and I followed the account. Here's what it looks like:  

[![Emoji Weather Map France](emoji_weather_map_france.png)](https://twitter.com/TweeteoFrance)

Following this, several community managers took the opportunity to re-interprate the idea for the brands they were representing. It quickly became a meme [Yahoo UK even reported it](https://uk.news.yahoo.com/weather-tweet-becomes-masterclass-french-161510338.html).

And another friend of mine sent me a roughly made version of Brittany, the France's region I am from, that he wanted to make aswell. This got me the idea to look online for a Japan version of it with the corresponding words, tenki 天気 for weather, emoji 絵文字 which is originally a japanese word. But I didn't find anything, so it was a little project that I could make.

The same way I made the [Twitter bot for my flying potato](), I decided to go with simple free services not asking for so much maintenance. Hook.io was one of the solution I had known that stores scripts online and executes them through an URL, as simple as I needed. A thing I didn't know before but that is very nice, is the ability to have your script directly on Github Gists and having it pulled automatically by hook.io, no pain to update your code unlike AWS Lambda for example.

With that settled, I started coding the script with the twitter package on NPM. I don't know how it will go for the future but Twitter is actually updating its developer platform as I write these lines. So, for now, I used the former apps, gaving me the customer key / secret and the access token / secret I needed to tweet on behalf of an account. The code then, is rather simple:

```javascript
import Twitter from 'twitter';

export default function postTweet(hook) {
  const client = new Twitter({
    consumer_key: hook.env.TWITTER_CONSUMER_KEY,
    consumer_secret: hook.env.TWITTER_CONSUMER_SECRET,
    access_token_key: hook.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: hook.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  const status = 'Hello word!';

  client.post('statuses/update', {status}, (err, data) => {
    if (err) console.log(err);
    
    hook.res.end('Tweet', status, 'has been sent!');
  });
};
```

And now onto the real problem, drawing the map and finding the weather. For the first one, I just went to my Twitter and played with spaces and the Sun emoji on the input text... But I quickly ran out of characters since Japan is a wide country but thanksfully, japanese full-width space is wide and only takes 2 characters like emojis. So here's my Japan emoji map:

![Emoji Weather Map Japan Sunny](emoji_weather_map_japan_sunny.png)

If you think you can do better, don't hesitate to send me your result, I would glady update my script.

To get the weather information, I use Yahoo Weather API through a SQL-like language they made, YQL. All the information I need is the climate code under condition. Yahoo also uses a thing called woeid to represents places. So I made a list of the places I thought the best and send it in only one request.

`select item.condition from weather.forecast where woeid in (1, 2, 3...)`

Now I only have to map the results to emojis. Here's the list from what I thought was the best:

code  |  emoji |  name
------|--------|-------------------------------------------
0     |   🌪️   | 	tornado
1     |   🌀   | 	tropical storm
2     |   🌀   | 	hurricane
3     |   ⛈   | 	severe thunderstorms
4     |   ⛈   | thunderstorms
5     |   🌧️   | 	mixed rain and snow
6     |   🌧️   | 	mixed rain and sleet
7     |   🌨️   | 	mixed snow and sleet
8     |   🌧️   | 	freezing drizzle
9     |   🌧️   | 	drizzle
10    |   🌧️   | 	freezing rain
11    |   💦   | 	showers
12    |   💦   | 	showers
13    |   ❄    |	snow flurries
14    |   🌨️   | 	light snow showers
15    |   ❄    | 	blowing snow
16    |   ❄    | 	snow
17    |   🌨️   | 	hail
18    |   🌨️   | 	sleet
19    |   🤔   | 	dust (I don  t know for this one yet)
20    |   🌁   | 	foggy
21    |   🌫️   | 	haze
22    |   🌫️   | 	smoky
23    |   💨   | 	blustery
24    |   🍃   | 	windy
25    |   🥶   | 	cold
26    |   ☁    | 	cloudy
27    |   ☁    | 	mostly cloudy (night)
28    |   🌥️   | 	mostly cloudy (day)
29    |   ☁    | 	partly cloudy (night)
30    |   🌤️   | 	partly cloudy (day)
31    |   🌑   | 	clear (night)
32    |   ☀    | 	sunny
33    |   🌑   | 	fair (night)
34    |   ☀    | 	fair (day)
35    |   🌧    | 	mixed rain and hail
36    |   🥵   | 	hot
37    |   ⚡️   | 	isolated thunderstorms
38    |   🌩️   | 	scattered thunderstorms
39    |   🌩️   | 	scattered thunderstorms
40    |   🌧    | 	scattered showers
41    |   ❄    | 	heavy snow
42    |   🌨    | 	scattered snow showers
43    |   ❄    | 	heavy snow
44    |   🌤    | 	partly cloudy
45    |   ⛈️   | 	thundershowers
46    |   ❄    | 	snow showers
47    |   ⛈️   | 	isolated thundershowers
3200  |   ❔    | 	not available

Last step, making it into the tweet, nothing more simple, dumping every variables into a template string, and sending the thing to Twitter. Interesting fact: Twitter trims the tweet, so you have to put something at the beginning that isn't a space.

And voilà!

![Emoji Weather Map Japan](emoji_weather_map_japan.png)

hook io cron 👎
IFTTT 👍
kanji map ?
