# THE UNBRICKING
A WIP Character Optimizer for ZZZ using EJS, MongoDB, Gemini API, and Render

What is a brick?
A bricked account, usually used in gacha games, is a particular account that is permanently ruined, useless, or impossible to progress on due to bad choices or poor investment. So, "unbricking" would be fixing said bricked account to hopefully save it.

The concept was to make a central web app that takes elements from many different sources, wikis, and even youtube videos so you'll have everything you need in one place.

Features and How to Use:
- After making an account (or using the test account), Miyabi welcomes you back.
- Click the arrow on the bottom right of the dialogue box to go to the characters page.
- Every user has a unique collection, mark the characters you own in game! (made possible with MongoDB)
- You can view all possible teams you can make with the characters you currently own!
- You can further inspect all possible teams of each character as well as recommended equipment and stats by clicking them.
- Imitation Fairy suggestions were made using Gemini API (Baby Fairy)

Disclaimers (addressing the elephant):
- Only current best teams are shown until another way to get team data is found.
- Consequentially, ONLY the following characters have data on teams and Gemini suggestions:

    - Hoshimi Miyabi
    - Zhu Yuan
    - Ye Shunguang
    - Yixuan
    - Jane Doe
    - Tsukishiro Yanagi
    - Ellen Joe
    - Evelyn Chevalier
    - Hugo Vlad
    - Soldier 0 - Anby
    - Aria

Future Plans:
- Implement a cleaner UI
- Use a better AI (I had to spoonfeed Gemini because it genuinely decided that some characters do not exist)
- More characters
- Explanations on play style for each team
- Optimal stat numbers

Run locally:
- node.js
- mongoDB cluster
- gemini api key
- npm install
- env containing:
    - PORT
    - ATLAS_URI
    - SESSION_SECRET = some-long-random-string-here
    - GEMINI_API_KEY
- run scripts:
    - node scripts/fetch-icons.js
    - node scripts/seed-characters.js
    - node scripts/seed-team-comps.js
    - node scripts/seed-builds.js
- then run using npm start

Or just enter through this link:
https://the-unbricking.onrender.com/

test account:
email: test@355.com
pass: 123
(you own everyone so no need to click all the "Mark as Owned" buttons!)
