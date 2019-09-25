// ==UserScript==
// @name         托福考位通知
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        toefl.neea.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function notifyMe() {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification("Hi there!");
            console.log('granted');
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
            console.log('denied');
        }

        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them any more.
    }

    notifyMe();

    // Your code here...

    let timerId = null;
    let expectedDays = ['2019-10-12', '2019-10-13', '2019-10-19'];
    let currentIndex = 0;

    function start() {
        if (timerId !== null) {
            return;
        }
        timerId = setInterval(() => {
            console.log('refersh');
            const province = document.getElementById('centerProvinceCity');
            province.value = 'QINGDAO';
            const testDays = document.getElementById('testDays');
            testDays.value = expectedDays[currentIndex];
            currentIndex += 1;
            if (currentIndex === expectedDays.length) {
                currentIndex = 0;
            }
            const queryButton = document.getElementById('btnQuerySeat');
            queryButton.click();
            const queryResult = document.getElementById('qrySeatResult');
            const hasButton = queryResult.querySelectorAll('input').length > 0;
            if (hasButton) {
                const notification = new Notification("We've got a seat!!!");
            }
        }, 3000);
    }

    function stop() {
        if (timerId !== null) {
            clearInterval(timerId);
        }
    }

    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.zIndex = 10000;
    panel.style.background = 'lightblue';
    panel.style.width = '200px';
    panel.style.height = '100px';
    panel.style.right = '1rem';
    panel.style.bottom = '1rem';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'row';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'space-around';
    document.body.appendChild(panel);
    const startButton = document.createElement('button');
    startButton.innerText = 'Start';
    startButton.onclick = () => start();
    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.onclick = () => stop();
    panel.appendChild(startButton);
    panel.appendChild(stopButton);
})();
