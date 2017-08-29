---
id: 394
title: 'Echofon for Firefox : The renewal'
date: "2015-03-17T23:10:25.000Z"
author: YoruNoHikage
layout: post
guid: http://blog.yorunohikage.fr/?p=394
path: "/2015/03/17/echofon-for-firefox-the-renewal/"
categories:
  - Development
---
_Hi there, I made a post few years ago about the dead Echofon for Firefox add-on. [JaHIY](https://github.com/JaHIY "JaHIY's Github") fixed the add-on to work with the new Twitter API 1.1. In my blog post, I was explaining how to tweak it to use our proper keys from Twitter so you can own the app if Echofon deletes theirs some day : you can read it here : [Echofon for Firefox (Twitterfox) is not dead (et espérons qu’elle le restera)](https://blog.yorunohikage.fr/2013/06/16/echofon-for-firefox-twitterfox-is-not-dead-et-esperons-quelle-le-restera/ "Echofon for Firefox (Twitterfox) is not dead (et espérons qu’elle le restera)") (Sorry, FR only :/)._

**After the update of Firefox 36, I discovered that tabs didn’t work anymore.** Looking at the Internet, I found some fixes (I <3 you people around the world) and a particular repository on GitHub taking the last version JaHIY made with the new fixes coming from other Echofon’s users. A new fork was born : [Echofon Firefox Unofficial](https://github.com/AntoineTurmel/echofon-firefox-unofficial "Echofon Firefox Unofficial on Github") created by Antoine Turmel.

During my research to find a better alternative to Echofon, I found [NotEchofon](https://github.com/notechofon/notechofon "NotEchofon on Github"), an older fork working with the new Twitter API 1.1. I was a bit disappointed when I saw that there was nothing more than JaHIY’s work. But with this new fork, I’m pretty excited, I’ll try pushing some code to make this extension better and why not, in the future, rewriting it entirely ~~with explosion animations~~.

Let’s talk about the changes made since I joined the happy community of Echofon’s forkers :

  * A script to build the add-on was written
  * The account registration on the add-on was fixed
  * Some graphical fixes

It is not a revolution, but enough to make it work and that’s fine. In the future, we’re going to face the [Firefox Extension signing](https://blog.mozilla.org/addons/2015/02/10/extension-signing-safer-experience/ "Introducing Extension Signing: A Safer Add-on Experience on Mozilla Blog") so we’re looking for a new name – Echofon is a trademark – and even if they doesn’t care about the fork (It is even a good advert for them), we’re going to publish this on the Mozilla Add-on platform. Help us finding it : [Rename addon – Issue #14](https://github.com/AntoineTurmel/echofon-firefox-unofficial/issues/14 "Rename addon - Issue #14 on GitHub").

There’s a lot to do to improve this extension :

  * Support the [new ctags Twitter has](http://www.wired.com/2009/02/on-twitter-is-t/ "On Twitter, $ Is the New # on Wired")
  * Refactor the media displayer : it is kind of annoying to have a tiny little mini cross to close the popup
  * Replace PixiClient with the new Twitter media API for uploading images
  * Refactor/Fix the notifications : they breaks the current focus, why not using something newest well-integrated with the OS
  * Supporting multiple persons DM
  * And more…

I thank [@AntoineTurmel](https://github.com/AntoineTurmel "AntoineTurmel on GitHub") who initiated the fork, [@ath0mas](https://github.com/ath0mas "ath0mas on GitHub") for its work on the repo and the others contributors who joined the project by replying to issues and opening pull requests ! I hope everybody will contribute and I invite you to do so. I’ll try to be more active on this project. You, guys, are awesome !
