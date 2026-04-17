Below are the Riot Games Developer Documntations and the actual APIs and my Development key 
DEVELOPMENT API KEY
This API key is to be used for development only. Please register any permanent products. Do NOT use this API key in a publicly available product!
RGAPI-f97fc5ef-fcc7-4c90-85c9-6b3384a9c634  
Expires: Fri, Apr 17th, 2026 @ 11:08am (PT) in 23 hours and 59 minutes


RATE LIMITS

20 requests every 1 seconds(s) 100 requests every 2 minutes(s) 
Note that rate limits are enforced per routing value (e.g., na1, euw1, americas)


LEAGUE OF LEGENDS Developer DOCS
Developer API Policy
Before you begin, read through the General and Game Policies, Terms of Use and Legal Notices. Developers must adhere to policy changes as they arise.
When developing using the API, you must abide by the following:
* Products cannot violate any laws.
* Do not create or develop games utilizing Riot’s Intellectual Property (IP).
* No cryptocurrencies or no blockchain.
* No apps serving as a “data broker” between our API and another third-party company.
* Products cannot closely resemble Riot’s games or products in style or function.
* Only the following Riot IP assets may be used in the development and marketing of your product:
    * Press kit
    * Example: Using Riot logos and trademarks from the Press Kit must be limited to cases where such use is unavoidable in order to serve the core value of the product.
    * Game-Specific static data
* You must post the following legal boilerplate to your product in a location that is readily visible to players:
    * [Your Product Name] is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
Registration
If your product serves players, you must register it with us regardless of whether or not your product uses official documented APIs. You must make sure its description and metadata are kept up to date with the current version of your product.
Monetization
To monetize your product, you must abide by the following:
* Your product cannot feature betting or gambling functionality.
* Your product must be registered on the Developer Portal and your product status is either Approved or Acknowledged.
* You must have a free tier of access for players, which may include advertising.
* Your content must be transformative if you are charging players for it.
    * What is transformative?
        * Was value added to the original by creating new information, new aesthetics, new insights, and understandings? If so, then it was transformative.
    * Acceptable ways to charge players are:
        * Subscriptions, donations, or crowdfunding.
        * Entry fees for tournaments.
        * Currencies that cannot be exchanged back into fiat.
    * Your monetization cannot gouge players or be unfair, as decided by Riot.
If you are unsure if your monetization platform is acceptable, contact us through the Developer Portal.
Security
You must adhere to the following security policies:
* Do not share your Riot Games account information with anyone.
* Do not use a Production API key to run multiple projects. You may only have one product per key.
* Use SSL/HTTPS when accessing the APIs so your API key is kept safe.
* Your API key may not be included in your code, especially if you plan on distributing a binary.
    * This key should only be shared with your teammates. If you need to share an API key for your product with teammates, make sure your product is owned by a group in the Developer portal. Add additional accounts to that account as needed.
Game Integrity
* Products must not use or incorporate information not present in the game client that would give players a competitive edge (e.g., automatically or manually allowing tracking enemy ultimate cooldowns), especially when such data is not already accessible through regular gameplay.
* Products cannot alter the goal of the game (i.e. Destroy the Nexus).
* Products cannot create an unfair advantage for players, like a cheating program or giving some players an advantage that others would not otherwise have.
* Products should increase, and not decrease the diversity of game decisions (builds, compositions, characters, decks).
* Products should not remove game decisions, but may highlight decisions that are important and give multiple choices to help players make good decisions.
* Products cannot create alternatives for official skill ranking systems such as the ranked ladder. Prohibited alternatives include MMR or ELO calculators.
* Products cannot identify or analyze players who are deliberately hidden by the game.
Tournament Policies
* Tournaments must:
    * Follow all monetization policies above.
    * Allot at least 70% of the entry fees to the prize pool.
    * Win conditions must be fair and transparent to players (we determine fair).
    * Must have at least 20 participants.
    * Not include any gambling.
* If you are a tournament organizer operating in the US or Canada please refer to, and adhere to, these North American tournament organizer policies.
* If you are a tournament organizer operating in Europe, please refer to, and adhere to, these European tournament organizer policies.
Summoner Names to Riot IDs
On November 20, 2023, we are transitioning our systems away from Summoner Names to using Riot ID as an authoritative way to reference players in League and TFT starting later this year. As such, you will need to make an update to the applicable API. Details for this transition can be found below.
All player-facing front-end fields and forms will require modification. Applications featuring the "Find your Summoner by Region + Name" functionality must adapt to locate summoners using Riot IDs, which are formed by combining the "game name" and "tag line".
For all other Riot API endpoints, filtering by player can be accomplished using either the PUUID or summonerID. Some APIs offer both options, but we recommend employing PUUID endpoints when available.
We recommend no longer using these endpoints (deprecated):
* https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerName - /lol/summoner/v4/summoners/by-name/{summonerName}
* https://developer.riotgames.com/apis#tft-summoner-v1/GET_getBySummonerName - /tft/summoner/v1/summoners/by-name/{summonerName}
Although deprecated, they can still be used to convert Summoner Names to PUUID or summonerID. However, we discourage using them as part of your application since they will be removed in the future.
Obtaining PUUID and summonerID from RiotID
* (ACCOUNT-V1) https://developer.riotgames.com/apis#account-v1/GET_getByRiotId - Utilize the endpoint /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine} to obtain the PUUID associated with a given account by Riot ID (gameName + tagLine).
* (SUMMONER-V4) https://developer.riotgames.com/apis#summoner-v4/GET_getByPUUID - Access the endpoint /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID} to retrieve summoner data by PUUID, including summonerID.
Obtaining Riot ID from PUUID
For third-party apps, displaying Riot IDs in place of summoner names within frontend fields is now necessary. If you lack a Riot ID for a particular player in your database or wish to keep it up to date, you can acquire it through the following endpoints:
* (ACCOUNT-V1) https://developer.riotgames.com/apis#account-v1/GET_getByPuuid - Use the endpoint /riot/account/v1/accounts/by-puuid/{puuid} to fetch account information (gameName + tagLine) by PUUID.
Obtaining Riot ID from summonerID
In cases where you do not possess a PUUID for a player, you can employ the player's summonerID to obtain the PUUID:
* (SUMMONER-V4) https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerId - Access the endpoint /lol/summoner/v4/summoners/{encryptedSummonerId} to retrieve summoner data by summonerID, which can be used to obtain the corresponding PUUID.
Summoner Names Post Migration
Following this migration, Summoner Names endpoints will remain accessible. However, they will no longer be player-facing. We intend to keep them temporarily to avoid disrupting existing APIs. For summoners created after this transition, they will be assigned a random uuidv4 generated string.
We strongly advise utilizing this deprecation period to refactor your existing applications and remove reliance on the summoner names field. In future releases, we will remove summoner names from the API altogether.
Example of a RiotID input:

Check our FAQ for more details!
Game Policy
Use Cases for Production Keys
Production keys are meant for larger-size, professional projects.
Riot analyzes two main factors when evaluating applications:
* Is the use case good and approved?
* Does the developer show they will deliver on that use case?
To demonstrate that your app meets the use case, you should be able to have one or more of the following:
* Be an established brand that wants to add Riot Games to its portfolio.
* New app that is fully functional and testable by Riot.
* Prototype that is mostly testable by Riot.
* Mockups where Riot can clearly express your intent and the user flow.
* A deck that shows your ambition and intent and some of the user flow.
Riot needs to see the user flow to understand what your intended player experience is, such as account creation process, login pipeline, or queuing up for match pipeline.
You must also send a link to a working site, mockup, prototype, or rendering where it is easy to understand the user flows of the tool.
Examples of Approved Use Cases for Personal Keys
Personal keys are meant for smaller-size, personal projects.
* Personal sites.
* School projects.
* Creating a proof of concept for a Production Key request
* Examples of Approved Use Cases for Production Keys.
* Showing (self) player stats
* Running tournaments.
* Training tools that allow players to view their own match histories and aggregate stats.
* Looking For Game (LFG) tools.
* Game overlays that provide static data that is available prior to the game.
* Aggregate player stats (no specific players).
* Official Ladder Leaderboards.
Examples of Unapproved Use Cases
The following use cases will not be approved:
* Products cannot display win rates for Augments or Arena Mode items. This applies to all websites, applications and overlays.
* Products may not provide any game-session-specific information that would be previously unknown to the player.
* Apps that dictate player decisions.
* Apps that violate the general game policies.
* Products may not publicly display a player's match history from the custom match queue unless the player opts in to share this specifically for League of Legends. Otherwise, a player’s custom match data may only be made available to them using RSO.
RSO Integration
RSO or Riot Sign On, allows players to safely link their Riot Account to other applications. This access is only available to developers with Production Level API Keys.
Getting a Production Key
Before you can get started with RSO, you will need a production key. If you do not have one, please create one at https://developer.riotgames.com after reading our policies. If approved, we will contact you in the developer portal app messaging to kick off the RSO integration process.
Implementing RSO
RSO - Client Secret Basic - Private Key JWT
Sample RSO Node App: https://static.developer.riotgames.com/docs/rso/rso-example-app.zip
Players should be directed to login at this link: https://auth.riotgames.com/authorize?client_id={your-client-id}&redirect_uri={your-redirect-uri}&response_type=code&scope=openid+offline_access.
After logging in, players are redirected back to the redirect_uri you specified. See Implementing Riot Sign On and Example RSO Node App for information about how to integrate with RSO and to view a sample Node web server that implements the example.
Your RSO client has access to endpoints that will allow you to identify who logged in.
For Legends of Legends, you will use /riot/account/v1/accounts/me:
curl --location --request GET 'https://americas.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}'
curl --location --request GET 'https://europe.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}' 
curl --location --request GET 'https://asia.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}' 
The accounts data return from each cluster is identical. We recommend using the cluster closest to your servers.
Routing Values
To execute a request to the League of Legends (LoL) API, you must select the correct host to execute your request to. LoL API uses routing values in the domain to ensure your request is properly routed. Platform IDs and regions as routing values, such as na1 and americas. Routing values are determined by the topology of the underlying services. Services are frequently clustered by platform resulting in platform IDs being used as routing values. Services may also be clustered by region, which is when regional routing values are used. The best way to tell if an endpoint uses a platform or a region as a routing value is to execute a sample request through the Reference page.
Platform Routing Values
PLATFORM	HOST
BR1	br1.api.riotgames.com
EUN1	eun1.api.riotgames.com
EUW1	euw1.api.riotgames.com
JP1	jp1.api.riotgames.com
KR	kr.api.riotgames.com
LA1	la1.api.riotgames.com
LA2	la2.api.riotgames.com
NA1	na1.api.riotgames.com
OC1	oc1.api.riotgames.com
TR1	tr1.api.riotgames.com
RU	ru.api.riotgames.com
PH2	ph2.api.riotgames.com
SG2	sg2.api.riotgames.com
TH2	th2.api.riotgames.com
TW2	tw2.api.riotgames.com
VN2	vn2.api.riotgames.com
Regional Routing Values
REGION	HOST
AMERICAS	americas.api.riotgames.com
ASIA	asia.api.riotgames.com
EUROPE	europe.api.riotgames.com
SEA	sea.api.riotgames.com
Data Dragon
Data Dragon is our way of centralizing League of Legends game data and assets, including champions, items, runes, summoner spells, and profile icons. All of which can be used by third-party developers. You can download a compressed tarball (.tgz) for each patch that contains all assets for that patch. Updating Data Dragon after each League of Legends patch is a manual process, so it is not always updated immediately after a patch.
Latest https://ddragon.leagueoflegends.com/cdn/dragontail-16.8.1.tgz
Patch 10.10 was uploaded as a zip archive (.zip) instead of the typical compressed tarball (.tgz) https://ddragon.leagueoflegends.com/cdn/dragontail-10.10.5.zip
Versions
You can find all valid Data Dragon versions in the versions file. Typically there is only a single build of Data Dragon for a given patch, however, there may be additional builds. This typically occurs when there is an error in the original build. As such, you should always use the most recent Data Dragon version for a given patch for the best results.
https://ddragon.leagueoflegends.com/api/versions.json
Regions
Data Dragon versions are not always equivalent to the League of Legends client version in a region. You can find the version each region is using in the realms files.
https://ddragon.leagueoflegends.com/realms/na.json
Data & Assets
Data Dragon provides two kinds of static data: data files and game assets. The data files provide raw static data on various components of the game such as summoner spells, champions, and items. The assets are images of the components described in the data files.
Data Files
The data file URLs include both a version and language code. The examples in the documentation below use version 16.8.1 and the en_US language code. If you want to view assets released in other versions or languages, replace the version or language code in the URL.
Languages
Data Dragon provides localized versions of each of the data files in languages supported by the client. Below is a list of the languages supported by Data Dragon, which you can also retrieve from the Data Dragon languages file.
https://ddragon.leagueoflegends.com/cdn/languages.json
CODE	LANGUAGE
cs_CZ	Czech (Czech Republic)
el_GR	Greek (Greece)
pl_PL	Polish (Poland)
ro_RO	Romanian (Romania)
hu_HU	Hungarian (Hungary)
en_GB	English (United Kingdom)
de_DE	German (Germany)
es_ES	Spanish (Spain)
it_IT	Italian (Italy)
fr_FR	French (France)
ja_JP	Japanese (Japan)
ko_KR	Korean (Korea)
es_MX	Spanish (Mexico)
es_AR	Spanish (Argentina)
pt_BR	Portuguese (Brazil)
en_US	English (United States)
en_AU	English (Australia)
ru_RU	Russian (Russia)
tr_TR	Turkish (Turkey)
ms_MY	Malay (Malaysia)
en_PH	English (Republic of the Philippines)
en_SG	English (Singapore)
th_TH	Thai (Thailand)
vi_VN	Vietnamese (Viet Nam)
id_ID	Indonesian (Indonesia)
zh_MY	Chinese (Malaysia)
zh_CN	Chinese (China)
zh_TW	Chinese (Taiwan)
Champions
There are two kinds of data files for champions. The champion.json data file returns a list of champions with a brief summary. The individual champion JSON files contain additional data for each champion.
https://ddragon.leagueoflegends.com/cdn/16.8.1/data/en_US/champion.json https://ddragon.leagueoflegends.com/cdn/16.8.1/data/en_US/champion/Aatrox.json
Interpreting Spell Text
Lore, tips, stats, spells, and even recommended items are all part of the data available for every champion. Champion spell tooltips often have placeholders for variables that are signified by double curly brackets. Here are some tips about interpreting these placeholders:
{{ eN }} placeholders Placeholders are replaced by the corresponding item in the array given in the effectBurn field. For example, {{ eN }} is a placeholder for spell["effectBurn"]["1"].
/* Amumu's Bandage Toss */
"tooltip": "Launches a bandage in a direction. If it hits an enemy unit, Amumu pulls himself to them, dealing {{ e1 }} <scaleAP>(+{{ a1 }})</scaleAP> magic damage and stunning for {{ e2 }} second.",
"effectBurn": [
  null,
  "80/130/180/230/280",
  "1",
  "1350",
  ...
]
{{ aN }} or {{ fN }} placeholders These placeholders are slightly more complicated. Their values can be found in the vars field. First, find the object in the vars array whose key matches the variable. For example, for {{ a1 }}, find the object in the vars array whose key field has the value a1. The value for this variable is the coeff field in that same object.
/* Amumu's Bandage Toss */
"tooltip": "Launches a bandage in a direction. If it hits an enemy unit, Amumu pulls himself to them, dealing {{ e1 }} <scaleAP>(+{{ a1 }})</scaleAP> magic damage and stunning for {{ e2 }} second.",
"vars": [
  {
    "key": "a1",
    "link": "spelldamage",
    "coeff": [
      0.7
    ]
  }
]
Under a champions spells there are two fields effect and effectBurn. effect contains an array of an ability's values per level where, in contrast, effectBurn contains a string of all the values at every level. (e.g., "effect": [30,60,90,120,150] vs "effectBurn": "30/60/90/120/150"). You might notice how the effect and effectBurn arrays have a null value in the 0 index. This is because those values are taken from designer-facing files where arrays are 1-based. JSON is 0-based so a null is inserted to make it easier to verify the JSON files are correct.
"effect": [
  null,
  [ 120, 150, 180, 210, 240 ],
  [ 50, 70, 90, 110, 130 ],
  [ 25, 35, 45, 55, 65 ],
  [ 0.2, 0.2, 0.2, 0.2, 0.2 ],
  [ 50, 60, 70, 80, 90 ]
],
"effectBurn": [
  "",
  "120/150/180/210/240",
  "50/70/90/110/130",
  "25/35/45/55/65",
  "0.2",
  "50/60/70/80/90"
]
Calculating Spell Costs
In most cases a spell costs mana or energy, you will find those related costs under the cost and costBurn fields. When a spell costs health, the cost will be found in the effect and effectBurn fields. You can determine how to calculate the cost of a spell by looking at the resource field, which should point you to the variable being used to display the cost of a spell.
/* Soraka's Astral Infusion */
"resource": "10% Max Health, {{ cost }} Mana",
"cost": [ 20, 25, 30, 35, 40 ],
"costBurn": "20/25/30/35/40"
/* Shen's Vorpal Blade */
"resource": "{{ cost }} Energy",
"cost": [ 60, 60, 60, 60, 60 ],
"costBurn": "60"
/* Dr. Mundo's Infected Cleaver */
"resource": "{{ e3 }} Health",
"cost": [ 0, 0, 0, 0, 0 ],
"costBurn": "0",
"effect": [
  null,
  [ 80, 130, 180, 230, 280 ],
  [ 15, 18, 21, 23, 25 ],
  [ 50, 60, 70, 80, 90 ],
  [ 40, 40, 40, 40, 40 ],
  [ 2, 2, 2, 2, 2 ]
],
"effectBurn": [
  "",
  "80/130/180/230/280",
  "15/18/21/23/25",
  "50/60/70/80/90",
  "40",
  "2"
]
Champion Splash Assets
https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg
The number at the end of the filename corresponds to the skin number. You can find the skin number for each skin in the file for each individual champion in Data Dragon. Each champion contains a skins array and the skin number is indicated by the num field.
Note that not all entries in the skins array will have a corresponding splash art. Some entries represent chromas, which do not have associated splash images.
Entries in the skins array that are not base skins will include a parentSkin field. This field can be used to identify and filter out chromas, as base skins do not contain it.
/* Aatrox (id: 266) */
"skins": [
  {
    "id": 266000,
    "name": "default",
    "num": 0,
    "chromas": false
  },
  {
    "id": 266001,
    "name": "Justicar Aatrox",
    "num": 1,
    "chromas": false
  },
  {
    "id": 266002,
    "name": "Mecha Aatrox",
    "num": 2,
    "chromas": true
  },
  {
    "id": "266003",
    "num": 3,
    "name": "Sea Hunter Aatrox",
    "chromas": false
  },
  {
    "id": "266004",
    "num": 4,
    "name": "Mecha Aatrox (Obsidian)",
    "chromas": false,
    "parentSkin": 2
  }
]
Champion Loading Screen Assets
https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg The number at the end of the filename follows the same convention described in the Champion Splash Art.
Champion Square Assets
https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aatrox.png
Champion Passive Assets
https://ddragon.leagueoflegends.com/cdn/16.8.1/img/passive/Anivia_P.png
You can find the filename for each champion's passive in the individual champion Data Dragon file. The JSON contains a passive field with image data. The filename is indicated by the full field.
/* Anivia (id: 34) */
"passive": {
  "name": "Rebirth",
  "description": "Upon dying, Anivia will revert into an egg. If the egg can survive for six seconds, she is gloriously reborn.",
  "image": {
    "full": "Anivia_P.png",
    "sprite": "passive0.png",
    "group": "passive",
    "x": 240,
    "y": 0,
    "w": 48,
    "h": 48
    }
  }
} 
Champion Ability Assets
https://ddragon.leagueoflegends.com/cdn/16.8.1/img/spell/FlashFrost.png
You can find the file name for each champion's abilities in the individual champion Data Dragon file. The spells field contains an array of objects which includes image data. The filename is indicated by the full field.
/* Anivia (id: 34) */
"spells": [
  {
    "id": "FlashFrost",
    "name": "Flash Frost",
    "description": "Anivia brings her wings together and summons a sphere of ice that flies towards her opponents, chilling and damaging anyone in its path. When the sphere explodes it does moderate damage in a radius, stunning anyone in the area.",
    "image": {
      "full": "FlashFrost.png",
      "sprite": "spell0.png",
      "group": "spell",
      "x": 192,
      "y": 144,
      "w": 48,
      "h": 48
    }
  },
  ...
]
Items
Data Dragon also provides the same level of detail for every item in the game. Within Data Dragon, you can find info such as the item's description, purchase value, sell value, items it builds from, items it builds into, and stats granted from the item.
https://ddragon.leagueoflegends.com/cdn/16.8.1/data/en_US/item.json
The effect field holds an array of variables used extra scripts. For example, on Doran's shield you see the following data in the effect field, which corresponds to the 8 damage that is blocked from champion attacks.
"effect": {
  "Effect1Amount": "8"
}
Stat Naming Conventions
A list of possible stats that you gain from items, runes, or masteries can also be found in Data Dragon. You can find a list of stats gained by the item, rune, or mastery by searching for the stats field. Below are some tips when it comes to understanding what a stat means and how they are calculated:
* Mod stands for modifier.
* An "r" at the beginning of the stat means those stats can be found on runes.
* Displaying flat vs. percentage vs. per 5 etc. is case-by-case. it will always be the same for a given stat. For example, PercentAttackSpeedMod will always be multiplied by 100 and displayed it as a percentage.
* Stats are called flat if you add them together, and percent if you multiply them together.
* Tenacity from an item does NOT stack but tenacity from a rune DOES stack.
Item Assets
https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/1001.png The number appended to the item filename corresponds to the item id. You can find a list of the items ids in the item data file.
Other
Summoner Spells
https://ddragon.leagueoflegends.com/cdn/16.8.1/data/en_US/summoner.json https://ddragon.leagueoflegends.com/cdn/16.8.1/img/spell/SummonerFlash.png
Profile Icons
https://ddragon.leagueoflegends.com/cdn/16.8.1/data/en_US/profileicon.json https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/685.png
Minimaps
https://ddragon.leagueoflegends.com/cdn/6.8.1/img/map/map11.png The number appended to the map filename corresponds to the map id. You can find a list of the map ids in the Map Names section of Game Constants.
Sprites
https://ddragon.leagueoflegends.com/cdn/16.8.1/img/sprite/spell0.png
Scoreboard Icons (version 5.5.1)
https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/champion.png https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/items.png https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/minion.png https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/score.png https://ddragon.leagueoflegends.com/cdn/5.5.1/img/ui/spells.png
Tournament API
League of Legends leverages custom game lobbies to support developers that want to build Tournaments for players. Custom games can use Tournament Code that help you quickly and easily get players into private custom game lobbies with preset game settings, such as map and pick type. At the completion of each Tournament Code enabled game, the results will be forwarded automatically (HTTP POST) to a URL specified by the tournament developer.

The Tournaments API allows you to:
1. Register tournament providers and tournaments in a specific region/shard and its callback URL.
2. Generate tournament codes for a given tournament.
3. Receive game results in the form of an automatic callback (HTTP POST) from League of Legends servers whenever a game created using tournament code has been completed.
4. Use match identifier (matchID) received in the callback to pull full stats data for the given match.
5. Pull end of game data based on given tournament code in case the callback is never received.
6. Query pre-game lobby player activity events for a given tournament code.
Best Practices
To preserve the quality of the tournaments service, your Tournaments API Key may be revoked if you do not adhere to the following best practices:
* Respect the rate limit for your Tournament API Key and implement logic that considers the headers returned from a 429 Rate Limit Exceeded response.
* Implement logic to detect unsuccessful API calls and back off accordingly. Please notify us if you believe your application is working correctly and you are receiving errors, but do not continue to slam the tournaments service with repeatedly unsuccessful calls.
* Generate tournaments and tournament codes only as needed in production and development. Please don't create 1,000 tournament codes for a 10 game tournament. As a reminder, you can always create additional tournament codes as your tournament grows.
* Tournaments and tournament codes should be generated within a reasonable time in relation to the event. Do not pre-create tournaments and tournament codes at the start of the year and use them as the year progresses, but rather generate the tournament and codes as the event is announced and participants sign up.
Tournament API Notes
When working with the Tournament API, keep the following in mind:
* Tournament providers are strongly associated with API keys, regenerating an API key will require a new provider.
* Though tournament codes can be re-used to generate additional lobbies. For best results with callbacks and Match-v5 lookups, create a single match with a tournament code.
* Lobby events should only be used to audit Tournament matches as needed. In rare cases lobby events may get dropped. Using lobby events to programmatically progress a tournament or to forfeit participants is not advised.
* Tournaments will expire if there are no active codes associated with the tournament. Tournament codes are eligible for expiration three months after they are generated. As tournaments and their codes can expire, creating them as close to the event as possible ensures no disruptions. For the best results:
    * Create a tournament no more than a week before the start of the first match.
    * Upon creation of the tournament, generate a code to ensure the tournament has an active tournament code associated with it (thereby making ineligible for cleanup).
    * Tournament codes should be generated as needed, not all at once at the start of the event.
Use Case Example
Presume there is a tournament website created for League of Legends players that does the following:
* Announces tournament and rules
* Registers players/teams
* Generates/renders tournament brackets
* Seeds registered teams across the brackets
* Sends invites for matched teams to play their games
* Collects end of game results from team captains
* Provides new matches for teams that advance
* Officiates for situations when something goes wrong (no show, etc)
The Tournaments API is designed to help automate the last four mentioned functions of tournament websites.
It is recommended to register a tournament provider (specifying region/shard and URL for results) well in advance and do a full loop testing to ensure everything is setup properly for your web service.
Tournaments API Structure
The Tournaments API introduces a simple parent-child data structure to ensure data model consistency:

Tournaments API Methods
Access to the Tournaments API provides several new methods that can be viewed on the API Reference page. You should explore every method to get more information on actual usage including the format and description of parameters you can supply.
See the diagram below for a full overview of all methods and their functionality:

Generating Tournament Codes
To generate tournament codes:
1. Use /lol/tournament/v5/providers API endpoint to register as a provider in specific region while also setting a URL to be used for receiving game results notifications (HTTP POST). Returns providerID.
2. Use providerID to register a tournament for given Tournament Provider. Receive tournamentID in return.
3. Use tournamentID to generate one or more tournament codes for a given tournament using specific game settings, such as map, spectator rules, or pick type.
    * A tournament code should only be used to create a single match. If you reuse a tournament code, the server callback will not return stats for each match.
    * The method to generate tournament codes will return up to 1,000 tournament codes at a time. If needed, additional calls to this method can be made to create additional tournament codes.
    * Stale or unused tournament codes may be purged after a period of inactivity.
Tournament organizers can generate all the tournament codes they need in advance or generate them as necessary per each phase as shown below:
Server Callback
When a game created using tournament code has completed, the League of Legends servers will automatically make a callback to the tournament provider's registered URL through HTTP POST. Below are a couple notes about how the server callback works.
The provider registration and callback mechanism are relatively inflexible. For best results, use one of the valid generic top level domains (gTLDs) listed below and use HTTP over HTTPS for your callback URL while using the metaData field to validate callbacks.
Port Restrictions The server callback supports http (port 80) and https (port 443) however Certificate Authorities (CA) approved after Jan 29, 2012 aren't supported. The callback server won't perform a callback if it is unable to validate an SSL cert issued by an unknown CA (and therefore doesn't trust).
Domain Restrictions Only valid gTLDs approved by ICANN before March 2011 are considered valid. This excludes newer gTLDs such as (.mail, .xxx, .xyz, etc.)
Valid gTLDs (approved before March 2011) aero, asia, biz, cat, com, coop, info, jobs, mobi, museum, name, net, org, pro, tel, travel, gov, edu, mil, int
Valid Country Code TLDs ac, ad, ae, af, ag, ai, al, am, an, ao, aq, ar, as, at, au, aw, ax, az, ba, bb, bd, be, bf, bg, bh, bi, bj, bm, bn, bo, br, bs, bt, bv, bw, by, bz, ca, cc, cd, cf, cg, ch, ci, ck, cl, cm, cn, co, cr, cu, cv, cx, cy, cz, de, dj, dk, dm, do, dz, ec, ee, eg, er, es, et, eu, fi, fj, fk, fm, fo, fr, ga, gb, gd, ge, gf, gg, gh, gi, gl, gm, gn, gp, gq, gr, gs, gt, gu, gw, gy, hk, hm, hn, hr, ht, hu, id, ie, il, im, in, io, iq, ir, is, it, je, jm, jo, jp, ke, kg, kh, ki, km, kn, kp, kr, kw, ky, kz, la, lb, lc, li, lk, lr, ls, lt, lu, lv, ly, ma, mc, md, me, mg, mh, mk, ml, mm, mn, mo, mp, mq, mr, ms, mt, mu, mv, mw, mx, my, mz, na, nc, ne, nf, ng, ni, nl, no, np, nr, nu, nz, om, pa, pe, pf, pg, ph, pk, pl, pm, pn, pr, ps, pt, pw, py, qa, re, ro, rs, ru, rw, sa, sb, sc, sd, se, sg, sh, si, sj, sk, sl, sm, sn, so, sr, st, su, sv, sy, sz, tc, td, tf, tg, th, tj, tk, tl, tm, tn, to, tp, tr, tt, tv, tw, tz, ua, ug, uk, um, us, uy, uz, va, vc, ve, vg, vi, vn, vu, wf, ws, ye, yt, yu, za, zm, zw
* The callback from the League of Legends server relies on a successful response from the provider's registered URL. If a 200 response is not detected, there is a retry mechanism that will make additional attempts. In the rare occasion that a callback is not received within 5 minutes, you can assume the callback failed.
* If you need to change your provider callback URL, register a new provider but remember tournaments generated with the old provider will continue to make callbacks to the old provider callback URL.
When a game created using Tournament Code has completed, the League of Legends servers will automatically make a callback to the tournament provider's registered URL via HTTP POST. Below are a couple notes about how the server callback works.
If you are having trouble debugging your logic, use the following cURL to mimic the behavior of the callback:
curl <callback_url> -X POST -H "Content-Type: application/json" -d '<response_body>'
Below is a sample JSON response returned by the League of Legends servers when a callback is made:
{
  "startTime": 1234567890000,
  "shortCode": "NA1234a-1a23b456-a1b2-1abc-ab12-1234567890ab",
  "metaData": "{\"title\":\"Game 42 - Finals\"}",
  "gameId": 1234567890,
  "gameName": "a123bc45-ab1c-1a23-ab12-12345a67b89c",
  "gameType": "Practice",
  "gameMap": 11,
  "gameMode": "CLASSIC",
  "region": "NA1"
}
Lobby Events
In addition to game stats related methods, the lobby-events/by-code/{tournamentCode} method that can help query pre-game lobby events. This is useful for building tournament administration system and be able to detect whether a game for a given tournament code started normally. This call can be made both after the match for the full timeline and anytime during the lobby phase for a timeline of events up to that moment. Below is an example of the JSON returned for lobby events:
{
  "eventList": [
    {
      "timestamp": "1234567890000",
      "eventType": "PracticeGameCreatedEvent", //Lobby Created
      "summonerId": "12345678"
    },
    {
      "timestamp": "1234567890000",
      "eventType": "PlayerJoinedGameEvent", //Player Joins Lobby
      "summonerId": "12345678"
    },
    {
      "timestamp": "1234567890000",
      "eventType": "PlayerSwitchedTeamEvent", //Player Switches Teams
      "summonerId": "12345678"
    },
    {
      "timestamp": "1234567890000",
      "eventType": "PlayerQuitGameEvent", //Player Leaves Lobby
      "summonerId": "12345678"
    },
    {
      "timestamp": "1234567890000",
      "eventType": "ChampSelectStartedEvent"  //Champ Select Begins
    },
    {
      "timestamp": "1234567890000",
      "eventType": "GameAllocationStartedEvent"  //Loading Screen Begins
    },
    {
      "timestamp": "1234567890000",
      "eventType": "GameAllocatedToLsmEvent"  //Game Begins
    }
  ]
}
League Client API
What is the League Client API?
In an article on the Riot Games Engineering Blog, there's an image that is useful for defining what we're classifying as "League Client APIs".
Specifically, we're referring to a set of protocols that the Chromium Embedded Framework (CEF) uses to communicate with a C++ Library that in turn communicates with the League of Legends platform. As you'll notice, the communications between the C++ library and the CEF all occur locally on your desktop. This is the League Client API. This service is not officially supported for use with third party applications.
NOTE: We provide no guarantees of full documentation, service uptime, or change communication for unsupported services. This team does not own any components of the underlying services, and will not offer additional support related to them.

What's next
Whether you're combining the Riot Games API and League Client API, or doing something by only using the League Client endpoints, we need to know about it. Either create a new application or leave a note on your existing application in the Developer Portal. We need to know which endpoints you're using and how you're using them in order to expand on current or future feature sets. If you have any questions please join the Developer Discord for help.
Game Client API
The Game Client APIs are served over HTTPS by League of Legends game client and are only available locally for native applications.
Root Certificate/SSL Errors
The League of Legends client and the game client use a self-signed certificate for HTTPS requests. To use the Game Client API, you can ignore these errors or use the root certificate to validate the game client's SSL certificate. If you are testing locally, you can use the following insecure CURL that will ignore the SSL certificate errors.
curl --insecure https://127.0.0.1:2999/swagger/v3/openapi.json
Swagger
You can request the Swagger v2 and OpenAPI v3 specs for the Game Client API with the following URLs: https://127.0.0.1:2999/swagger/v2/swagger.json https://127.0.0.1:2999/swagger/v3/openapi.json
Live Client Data API
The Live Client Data API provides a method for gathering data during an active game. It includes general information about the game as well player data.
Get All Game Data
The Live Client Data API has a number of endpoints that return a subset of the data returned by the /allgamedata endpoint. This endpoint is great for testing the Live Client Data API, but unless you actually need all the data from this endpoint, use one of the endpoints listed below that return a subset of the response.
GET https://127.0.0.1:2999/liveclientdata/allgamedata Get all available data.
You can find a sample response here.
Endpoints
Active Player GET ​https://127.0.0.1:2999/liveclientdata/activeplayer Get all data about the active player.
{
    "abilities": {...},
    "championStats": {
      "abilityHaste": 0.00000000000000,
      "abilityPower": 0.00000000000000,
      "armor": 0.00000000000000,
      "armorPenetrationFlat": 0.0,
      "armorPenetrationPercent": 0.0,
      "attackDamage": 0.00000000000000,
      "attackRange": 0.0,
      "attackSpeed": 0.00000000000000,
      "bonusArmorPenetrationPercent": 0.0,
      "bonusMagicPenetrationPercent": 0.0,
      "cooldownReduction": 0.00,
      "critChance": 0.0,
      "critDamage": 0.0,
      "currentHealth": 0.0,
      "healthRegenRate": 0.00000000000000,
      "lifeSteal": 0.0,
      "magicLethality": 0.0,
      "magicPenetrationFlat": 0.0,
      "magicPenetrationPercent": 0.0,
      "magicResist": 0.00000000000000,
      "maxHealth": 0.00000000000000,
      "moveSpeed": 0.00000000000000,
      "physicalLethality": 0.0,
      "resourceMax": 0.00000000000000,
      "resourceRegenRate": 0.00000000000000,
      "resourceType": "MANA",
      "resourceValue": 0.00000000000000,
      "spellVamp": 0.0,
      "tenacity": 0.0
    }
    "currentGold": 0.0,
    "fullRunes": {...},
    "level": 1,
    "summonerName": "Riot Tuxedo",
    "riotId": "Riot Tuxedo#TXC1",
    "riotIdGameName": "Riot Tuxedo",
    "riotIdTagLine": "TXC1"
}
GET ​https://127.0.0.1:2999/liveclientdata/activeplayername Returns the player name.
"Riot Tuxedo#TXC1"
GET ​https://127.0.0.1:2999/liveclientdata/activeplayerabilities Get Abilities for the active player.
{
    "E": {
        "abilityLevel": 0,
        "displayName": "Molten Shield",
        "id": "AnnieE",
        "rawDescription": "GeneratedTip_Spell_AnnieE_Description",
        "rawDisplayName": "GeneratedTip_Spell_AnnieE_DisplayName"
    },
    "Passive": {
        "displayName": "Pyromania",
        "id": "AnniePassive",
        "rawDescription": "GeneratedTip_Passive_AnniePassive_Description",
        "rawDisplayName": "GeneratedTip_Passive_AnniePassive_DisplayName"
    },
    "Q": {
        "abilityLevel": 0,
        "displayName": "Disintegrate",
        "id": "AnnieQ",
        "rawDescription": "GeneratedTip_Spell_AnnieQ_Description",
        "rawDisplayName": "GeneratedTip_Spell_AnnieQ_DisplayName"
    },
    "R": {
        "abilityLevel": 0,
        "displayName": "Summon: Tibbers",
        "id": "AnnieR",
        "rawDescription": "GeneratedTip_Spell_AnnieR_Description",
        "rawDisplayName": "GeneratedTip_Spell_AnnieR_DisplayName"
    },
    "W": {
        "abilityLevel": 0,
        "displayName": "Incinerate",
        "id": "AnnieW",
        "rawDescription": "GeneratedTip_Spell_AnnieW_Description",
        "rawDisplayName": "GeneratedTip_Spell_AnnieW_DisplayName"
    }
}
GET ​https://127.0.0.1:2999/liveclientdata/activeplayerrunes Retrieve the full list of runes for the active player.
{
    "keystone": {
        "displayName": "Electrocute",
        "id": 8112,
        "rawDescription": "perk_tooltip_Electrocute",
        "rawDisplayName": "perk_displayname_Electrocute"
    },
    "primaryRuneTree": {
        "displayName": "Domination",
        "id": 8100,
        "rawDescription": "perkstyle_tooltip_7200",
        "rawDisplayName": "perkstyle_displayname_7200"
    },
    "secondaryRuneTree": {
        "displayName": "Sorcery",
        "id": 8200,
        "rawDescription": "perkstyle_tooltip_7202",
        "rawDisplayName": "perkstyle_displayname_7202"
    },
    "generalRunes": [
        {
            "displayName": "Electrocute",
            "id": 8112,
            "rawDescription": "perk_tooltip_Electrocute",
            "rawDisplayName": "perk_displayname_Electrocute"
        },
        ...
    ],
    "statRunes": [
        {
            "id": 5007,
            "rawDescription": "perk_tooltip_StatModCooldownReductionScaling"
        },
        {
            "id": 5008,
            "rawDescription": "perk_tooltip_StatModAdaptive"
        },
        {
            "id": 5003,
            "rawDescription": "perk_tooltip_StatModMagicResist"
        }
    ]
}
All Players GET ​https://127.0.0.1:2999/liveclientdata/playerlist Retrieve the list of heroes in the game and their stats.
[
    {
        "championName": "Annie",
        "isBot": false,
        "isDead": false,
        "items": [...],
        "level": 1,
        "position": "MIDDLE",
        "rawChampionName": "game_character_displayname_Annie",
        "respawnTimer": 0.0,
        "runes": {...},
        "scores": {...},
        "skinID": 0,
        "summonerName": "Riot Tuxedo",
        "riotId": "Riot Tuxedo#TXC1",
        "riotIdGameName": "Riot Tuxedo",
        "riotIdTagLine": "TXC1",
        "summonerSpells": {...},
        "team": "ORDER"
    },
    ...
]
GET ​https://127.0.0.1:2999/liveclientdata/playerscores?riotId= Retrieve the list of the current scores for the player.
{
    "assists": 0,
    "creepScore": 0,
    "deaths": 0,
    "kills": 0,
    "wardScore": 0.0
}
GET ​https://127.0.0.1:2999/liveclientdata/playersummonerspells?riotId= Retrieve the list of the summoner spells for the player.
{
    "summonerSpellOne": {
        "displayName": "Flash",
        "rawDescription": "GeneratedTip_SummonerSpell_SummonerFlash_Description",
        "rawDisplayName": "GeneratedTip_SummonerSpell_SummonerFlash_DisplayName"
    },
    "summonerSpellTwo": {
        "displayName": "Ignite",
        "rawDescription": "GeneratedTip_SummonerSpell_SummonerDot_Description",
        "rawDisplayName": "GeneratedTip_SummonerSpell_SummonerDot_DisplayName"
    }
}
GET ​https://127.0.0.1:2999/liveclientdata/playermainrunes?riotId= Retrieve the basic runes of any player.
{
    "keystone": {
        "displayName": "Electrocute",
        "id": 8112,
        "rawDescription": "perk_tooltip_Electrocute",
        "rawDisplayName": "perk_displayname_Electrocute"
    },
    "primaryRuneTree": {
        "displayName": "Domination",
        "id": 8100,
        "rawDescription": "perkstyle_tooltip_7200",
        "rawDisplayName": "perkstyle_displayname_7200"
    },
    "secondaryRuneTree": {
        "displayName": "Sorcery",
        "id": 8200,
        "rawDescription": "perkstyle_tooltip_7202",
        "rawDisplayName": "perkstyle_displayname_7202"
    }
}
GET ​https://127.0.0.1:2999/liveclientdata/playeritems?riotId= Retrieve the list of items for the player.
[
    {
        "canUse": true,
        "consumable": false,
        "count": 1,
        "displayName": "Warding Totem (Trinket)",
        "itemID": 3340,
        "price": 0,
        "rawDescription": "game_item_description_3340",
        "rawDisplayName": "game_item_displayname_3340",
        "slot": 6
    },
    ...
]
Events GET ​https://127.0.0.1:2999/liveclientdata/eventdata Get a list of events that have occurred in the game.
{
    "Events": [
        {
            "EventID": 0,
            "EventName": "GameStart",
            "EventTime": 0.0325561985373497
        },
        ...
    ]
}
You can find a list of sample events here.
Game GET ​https://127.0.0.1:2999/liveclientdata/gamestats Basic data about the game.
{
  "gameMode": "CLASSIC",
  "gameTime": 0.000000000,
  "mapName": "Map11",
  "mapNumber": 11,
  "mapTerrain": "Default"
}
Any of these endpoints that returned a summonerName, now return a RiotID shim over summonerName, and new fields called riotId, riotIdGameName and riotIdTagLine in structured responses. Any endpoints that took a SummonerName as a parameter now accepts only the riotId parameter. It attempts to match the name to RiotID first, then RiotIDGameName, then SummonerName (to maintain backwards compatibility until we can fully deprecate SummonerName).
Replay API
The Replay API allows developers to adjust the in-game camera during replays. League Director is an open source example of how a tool can leverage the Replay API.
Getting Started
By default the Replay API is disabled. To start using the Replay API, enable the Replay API in the game client config by locating where your game is installed and adding the following lines to the game.cfg file:
Example file location: C:\Riot Games\League of Legends\Config\game.cfg
[General]
EnableReplayApi=1
Once you have enabled the Replay API, the game client will generate the Swagger v2 and OpenAPI v3 specs for the Replay API, which indicates the Replay API is usable.
Endpoints
GET https://127.0.0.1:2999/replay/game Information about the game client process.
GET https://127.0.0.1:2999/replay/playback Returns the current replay playback state such as pause and current time.
POST https://127.0.0.1:2999/replay/playback Allows modifying the playback state such as play/pause and the game time to seek to. All values are optional.
GET https://127.0.0.1:2999/replay/render Returns the current render properties.
POST https://127.0.0.1:2999/replay/render Allows modifying the current render properties. All values are optional.
GET https://127.0.0.1:2999/replay/recording Returns the current status of video recording. Poll this resource for progress on the output.
POST https://127.0.0.1:2999/replay/recording Post to begin a recording specifying the codec and output filepath. Subsequent GET requests to this resource will update the status.
GET https://127.0.0.1:2999/replay/sequence Returns the sequence currently being applied.
POST https://127.0.0.1:2999/replay/sequence Post to apply a sequence of keyframes that the replay should play. Post an empty object to remove the sequence.
Working with LoL APIs
Game Constants
When looking up specific seasons, queues, maps, and modes it is important to use the correct IDs.
Seasons
Season IDs are used in match history to indicate which season a match was played. A full list of season ids can be found in seasons.json.
[
  {
    "id": 0,
    "season": "PRESEASON 3"
  },
  ...
]
Queue IDs
Queue IDs show up in several places throughout the API and are used to indicate which kind of match was played. A full list of queue ids can be found in queues.json.
Note: In early 2022, URF (previously queueId 900) was divided into separate queues— ARURF (queueId 900) and Pick URF (queueId 1900). All Pick URF games from before this distinction will still be in queueId 900.
[
  {
    "queueId": 0,
    "map": "Custom games",
    "description": null,
    "notes": null
  },
  ...
]
Maps
Map IDs are used in match history to indicate which map a match was played. A full list of map IDs can be found in maps.json.
[
  {
    "mapId": 1,
    "mapName": "Summoner's Rift",
    "notes": "Original Summer variant"
  },
  ...
]
Game Modes
A full list of game modes can be found in gameModes.json.
[
  {
    "gameMode": "CLASSIC",
    "description": "Classic Summoner's Rift and Twisted Treeline games"
  },
  ...
]
Game Types
A full list of game types can be found in gameTypes.json.
[
  {
    "gameType": "CUSTOM_GAME",
    "description": "Custom games"
  },
  ...
]
Ranked Info
Queue Types
The League endpoints return a field called queueType that indicates what map/mode a player played. Depending on the queueType, the highestTierAchieved field returns the highest ending tier for the previous season from a group of ranked queues.
Here is a list of all of the queueType and highestTierAchieved for each.
Summoner's Rift
Unranked
    RANKED_SOLO_5x5
    RANKED_TEAM_5x5
Ranked Solo/Duo
    RANKED_SOLO_5x5
Ranked Team 5x5
    RANKED_TEAM_5x5
Other Maps
If a match is not played on Summoner's Rift, the highestTierAchieved field will return the highest ending tier for the previous season from any ranked queue.
Icons and Emblems
The most recent emblems assets for all ranks can be found below.

ranked-emblems-latest.zip
Older tier icon assets can be found below.

ranked-emblems.zip ranked-positions.zip

tier-icons.zip


VALORANT Developer Docs
Developer API Policy
Before you begin, read through the General and Game Policies, Terms of Use and Legal Notices. Developers must adhere to policy changes as they arise.
Registration
If your product serves players, you must register it with us regardless of whether or not your product uses official documented APIs. You must make sure its description and metadata are kept up to date with the current version of your product.
Monetization
To monetize your product, you must abide by the following:
* Your product cannot feature betting or gambling functionality.
* Your product must be registered on the Developer Portal and your product status is either Approved or Acknowledged.
* You must have a free tier of access for players, which may include advertising.
* Your content must be transformative if you are charging players for it.
* What is transformative?
    * Was value added to the original by creating new information, new aesthetics, new insights, and understandings? If so, then it was transformative.
* Acceptable ways to charge players are:
    * Subscriptions, donations, or crowdfunding.
    * Entry fees for tournaments.
    * Currencies that cannot be exchanged back into fiat.
* Your monetization cannot gouge players or be unfair, as decided by Riot.
If you are unsure if your monetization platform is acceptable, contact us through the Developer Portal.
Security
You must adhere to the following security policies:
* Do not share your Riot Games account information with anyone.
* Do not use a Production API key to run multiple projects. You may only have one product per key.
* Use SSL/HTTPS when accessing the APIs so your API key is kept safe.
* Your API key may not be included in your code, especially if you plan on distributing a binary.
* This key should only be shared with your teammates. If you need to share an API key for your product with teammates, make sure your product is owned by a group in the Developer portal. Add additional accounts to that account as needed.
Game Integrity
* Products cannot alter the goal of the game (i.e. Destroy the Nexus).
* Products cannot create an unfair advantage for players, like a cheating program or giving some players an advantage that others would not otherwise have.
* Products should increase, and not decrease the diversity of game decisions (builds, compositions, characters, decks).
* Products should not remove game decisions, but may highlight decisions that are important and give multiple choices to help players make good decisions.
* Products cannot create alternatives for official skill ranking systems such as the ranked ladder. Prohibited alternatives include MMR or ELO calculators.
* Products cannot identify or analyze players who are deliberately hidden by the game.
Tournament Policies
* Tournaments must:
* Follow all monetization policies above.
* Allot at least 70% of the entry fees to the prize pool.
* Win conditions must be fair and transparent to players (we determine fair).
* Must have at least 20 participants.
* Not include any gambling.
* If you are a tournament organizer operating in the US or Canada please refer to, and adhere to, Valorant Tournament Policies section at the bottom of this page or download the comprehensive document.
* If you are a tournament organizer operating in Europe/Asia/Pacific, please refer to, and adhere to, these European tournament organizer policies.
Game Policy
Note: Personal Key Applications are currently not supported.
Use Cases
Riot analyzes two main factors when evaluating applications:
* Is the use case good and approved?
* Does the developer show they will deliver on that use case?
To demonstrate that your app meets the use case, you should have one or more of the following:
* Be an established brand that wants to add Riot Games to its portfolio.
* New app that is fully functional and testable by Riot.
* Prototype that is mostly testable by Riot.
* Mockups where Riot can clearly express your intent and the user flow.
* A deck that shows your ambition and intent and some of the user flow.
Riot needs to see the user flow to understand what your intended player experience is, such as account creation process, login pipeline, or queuing up for match pipeline.
You must also send a link to a working site, mockup, prototype, or rendering where it is easy to understand the user flows of the tool.
Note: All apps must include functionality requiring a player to opt-in to sharing their data. This is done through RSO integration, as well as a disclaimer within your app that account linking makes player data public.
Disclaimer: All third-party Valorant sites approved for RSO must include a disclaimer for Opt-in policies, where all players must first sign up for their service to display their stats/gameplay data. If players have not opted into data sharing in their ecosystem, their information should not be made available to other players through their website, applications, or game overlays.
Examples of Approved Use Cases
Require Player Opt-in
The following accepted use cases require a player to opt-in:
* Showing player stats.
* Running tournament brackets with verified players.
* Tournaments.
* Training tools that allow players to view their own match histories and aggregate stats.
* LFG tools.
* Apps to assist live streaming, such as pulling player stats.
* Discord Bots showing community leaderboards, stats for server members.
Do Not Require Player Opt-in
The following accepted use cases do not require a player to opt-in:
* Aggregate player stats without any specific players.
* Official ladder leaderboards.
 
Examples of Unapproved Use Cases
The following use cases will not be approved:
* Scouting, which is seeing an opponents stats before a match starts.
* Apps that are not public and are designed for personal use only.
* Online store tracking or updates. The technology for this does not currently exist in the API.
* In-game apps and overlays that include any real-time data that would improve a player’s performance immediately by altering player behavior (i.e. ‘go here now’), vs altering it upon reflection, learning and coaching the player game over game.
* Static in-game overlays that block parts of the map.
RSO Integration
All VALORANT apps must request that users opt-in to sharing their personal data. To do this, your application will need to verify players using an OAuth flow. This is done through Riot Sign On (RSO) using an RSO Client.
RSO or Riot Sign On, allows players to safely link their Riot Account to other applications. This access is only available to developers with Production Level API Keys.
Getting a Production Key
Before you can get started with RSO, you will need a production key. If you do not have one, please request one at developer.riotgames.com after reading through our policies. If approved, we will contact you in the developer portal app messaging to kick off the RSO integration process.
Implementing RSO
All VALORANT apps must request that users opt-in to sharing their personal data. To do this, your application will need to verify players using an OAuth flow. This is done through Riot Sign On (RSO) using an RSO Client.
* Client Secret Basic RSO instructions: Implementing Riot Sign On
* JWT RSO instructions: Implementing RSO - JWT
* Sample RSO Node App
Players should be directed to login at this link:
https://auth.riotgames.com/authorize?client_id=&redirect_uri=&response_type=code&scope=openid+offline_access.
After logging in, players are redirected back to the redirect_uri you specified.
Your RSO client has access to endpoints that will allow you to identify who logged in. For VALORANT, you will use /riot/account/v1/accounts/me:
curl --location --request GET 'https://americas.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}'
curl --location --request GET 'https://europe.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}' 
curl --location --request GET 'https://asia.api.riotgames.com/riot/account/v1/accounts/me' --header 'Authorization: Bearer {accessToken}' 
Assets
Public Content Catalog
The public content catalog is a set of VALORANT assets, including icons, logos, text, etc. that is free to use. The file contains both images and a .json with all the textural information.
Updating the public content catalog after each VALORANT patch is a manual process, so it is not always updated immediately after a patch.
https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.07.zip
Valorant Official APIs
For the most comprehensive information on our APIs, see the Developer API site.
API	METHOD	DESCRIPTION
VAL-CONTENT-V1	/val/content/v1/contents	Get content; optionally filtered by locale
VAL-MATCH-V1	/val/match/v1/matches/{matchId}	Get match by ID
	/val/match/v1/matchlists/by-puuid/{puuid}	Get matchlist for games played by PUUID
	/val/match/v1/recent-matches/by-queue/{queue}	Get recent matches
VAL-RANKED-V1	/val/ranked/v1/leaderboards/by-act/{actId}	Get leaderboard for the competitive queue
VAL-STATUS-V1	/val/status/v1/platform-data	Get VALORANT status for the given platform
Valorant Tournament Policies
Community Competition Tiers
TIER	ORGANIZER	PLATFORM / SCALE	ORGANIZER GOAL	RIOT’S CONTRIBUTION
Small Tournaments	Players, PC Cafes, Community Organizers	Prize Pool ≤$10,000 USD (or $12,000 in non-cash); Local event only	Fun, Organized, Social Play	No IP use other than the IP providedhere
Medium Tournaments	Endemic Amateur TOs, Esports Orgs, Influencers	Prize Pool ≤ $50,000 USD; No guaranteed implications in VALORANT Global Esports	Monetization / Brand or Business Growth	Based on agreement with regional Riot team
Major Tournaments	Major Esport Event Organizers (e.g., ESL, DreamHack, OGN)	Official Semi-Pro; Part of Global Competitive Ecosystem	Monetization + Contribution to Global Ecosystem	Based on agreement with global Riot team
I. Application Process
* Small Tournaments: No application needed; follow these guidelines.
* Medium Tournaments: Custom license required. Apply to your regional Riot Esports team.
* Major Tournaments: Custom license required. Apply to the Global Riot Esports team.
II. Trademarks or Affiliation
* Small Tournaments: 
* May use "VALORANT" name but not "Championship", "League", etc. 
* No Riot logos or trademarks.
* Must display: "This competition is not affiliated with or sponsored by Riot Games, Inc. or VALORANT Esports."
* Medium & Major Tournaments: 
* May request permission to use Riot/VALORANT assets. 
* No title sponsors or branded tournaments.
III. Entry Fees
* Entry fees allowed to cover event costs or fund prize pools.
* Crowdfunding allowed but funds must go to event costs or prizes.
IV. Prizing
* Small: Max $10,000 per event; $100,000/year.
* Medium: Max $50,000 per event; $200,000/year.
* Major: Riot may contribute.
V. Duration
* Small & Medium:
* Max 8 weeks total.
* High school/college events: Max 5 months (Aug–Dec or Jan–May).
VI. Broadcasting
* Small:
* Free to stream on any platform (except TV); must moderate chat and disable "Show Blood".
* Medium & Major:
* Must follow broadcast terms in custom license.
* Riot may request promotion of Riot channels if they contribute/support.
VII. Sponsors & Partners
* Small: 
* Sponsors allowed (unless on Prohibited List). 
* Max $10,000 per tournament / $100,000 per year.
* Medium & Major: 
* Same sponsor restrictions. Riot may assist monetization. 
Prohibited Sponsors Include:
* Other video games or publishers
* Gambling, tobacco, alcohol, firearms, adult content
* Cryptocurrencies, political campaigns, unreputable charities, etc.
VIII. Merchandising
* Small: No sale of Riot/VALORANT-branded merchandise.
* Medium & Major: Riot may allow merchandise or provide items.
IX. Riot Games’ Rights to Content
By using the Community Competition License:
* Riot can promote your competition and use its content.
* You license Riot free and perpetual use of your competition’s media (broadcasts, highlights, etc.).
X. Legal Terms
* All competitions must comply with:
* Riot's guidelines, Terms of Service, and Legal Jibber Jabber
* Local laws and platform policies (e.g., Twitch, YouTube)
Riot grants a limited, non-transferable, revocable license to run VALORANT competitions, but retains the right to shut down any competition that violates policies or values.



RIOT DEVELOPER PORTAL
Overview
This document will provide you with a basic understanding of the Riot Games Developer Portal. It is designed to help you begin exploring and developing your own tools and products to positively impact the experience for players of Riot's games. We can't wait to see what you make!
Getting Started
Before you can begin taking advantage of the Developer Portal, you must login with your Riot Games account. Once you do, a Developer Portal account is created for you! This action also generates a basic development API key that is associated with your account. We'll talk about how you can interact with Riot to enhance that key further on in this documentation.
This account gives you the option to register your product proposal with Riot's Developer Relations team. Once you've registered your product you can communicate with our team for approvals, increased access, and more.
Product Registration
If you're here, you're probably thinking about making a cool application or website for a Riot game. For simplicity, we'll broadly call those things "products". As mentioned above, once you've logged in to the Developer Portal, you'll be able to register your product proposal. Let's go over what that entails.
Application Process
First off, every product owner (developer) will be expected to have read and understood our policies. You can find them in the nav bar at the top of this page. Read them. Failure to adhere to these policies may lead to punitive actions, so make sure you understand them before going too far forward.
Even if your product doesn't use the Riot Games API, you'll find it beneficial to register your product. Registration lets Riot know you're out there, doing great stuff. If we know you're out there, then we can keep you informed of opportunities that might be beneficial to you and your product(s). Also, you will have a pathway to let us know how Riot can better help you and other developers.
So, how do you get registered?
It's simple. Head back to the main page of the Developer Portal and click the Register Product button. From there you'll need to decide if this is for a larger scale product, or a personal project. From there we'll ask you to fill out an online form that gathers some key details about your product. Finally, we'll ask you to verify your product, just to make sure you're really the developer!
Once you've completed those steps, our Developer Relations team will review your proposal. If everything is in order, we'll approve your product, and you're on your way to unlocking additional rate limits for your API key, and building a relationship with the team to help improve your product.
If your product is approved, we expect you to keep it in compliance of all applicable rules, policies, and laws. It's on you to stay up to date on all of those. If you need help with that, leave us a message in the Developer Portal, or jump into the Developer Discord.
If your product proposal is rejected, we'll be sure to leave you a message in the Developer Portal. We want you to succeed, so feel free to work with us through that messaging system to address our concerns, and get your great idea into the hands of players.
When reviewing applications we take a look at a lot of factors to determine if it's something that will benefit the Riot Games ecosystem. Of note, we want to make sure that the product doesn't violate any laws or existing policies. We'll also want to make sure that the product helps players in some measurable way. We want to see product that help players get better at our games, or track their growth. What we don't want to see are products that solve our games or make everything too simple. Also, we are looking for quality. If your website isn't complete, we're unlikely to approve your product. If you have questions, though, just reach out through the Developer Portal's messaging system.
About that messaging system...
Messages
We’ll send approval and rejection notifications to you directly in your application messages on the Developer Portal. If we have questions about a pending application, we’ll be sure that you have a way to respond to us on the Developer Portal.
If you have questions specific to your product registration, you can send a message on our Support Site to get some feedback. Using the Support Site is the surest and quickest way to get a response from the Developer Relations team. Further, if you have any questions about your live products or anything else in the ecosystem, you can submit a message and we'll respond. A caveat: Don't use the messaging system irresponsibly. This isn't a channel for you to casually chat with Rioters. This is a business channel, and should be treated as such.
Web APIs
Your product might depend on the Riot Games API. If it does, you'll need to be sure you understand some basic concepts about your Riot Games API key.
API Keys
Anyone who signs into the developer portal will automatically be granted an API key that will be associated with their account. Your API key allows you to start using the API immediately, and allows us to generate API usage metrics for your key. In all, we manage several types of API keys. See the differences below.
DEVELOPMENT API KEYS
The API key that was generated for you when you signed into the developer portal is a development API key. These interim API keys are temporarily granted for products that are not meant for public consumption but benefit from temporary access to the API. The purpose of a development API key is for you to tinker with the Riot Games API and potentially develop a prototype for a product that you can make available for the community to use. They also deactivate every 24 hours. You'll need to regularly reset yours to keep it live.
PERSONAL API KEYS
You may apply for a personal API key by registering your product. Personal API keys should be used for products that are intended for just the developer or a small private community. These products can be registered without the verification process, but won't be approved for rate limit increases. You may request access to the Standard APIs, but not the Tournaments API. Personal keys require a detailed description of the product.
Acceptable uses for a personal API key include:
* bots for streaming sites, boards, voice com servers, etc.
* to display your own personal stats for your personal website
* personal projects to gather your own stats
* personal research
* projects meant for personal usage and not production
The rate limit for a personal keys is by design very limited:
* 20 requests every 1 second
* 100 requests every 2 minutes
Note that rate limits are enforced per region. For example, with the above rate limit, you could make 20 requests every 1 second to both the NA and EUW League of Legends endpoints simultaneously.
You may not run your application for public consumption using a personal key, regardless of how long the approval process for your production key takes. Note that public consumption includes open alpha/beta tests.
PRODUCTION API KEYS
If you have developed an application using the Riot Games API that you would like to open up to players, you should apply for a production API key. You may not maintain a public product with a development API key. Production API keys have a much higher rate limit suitable for sustaining a public product's traffic.
Production API keys should be used for products that are intended for large communities or the Internet as a whole. You may request access to the Standard APIs and the Tournaments API. Typically requires a working prototype before receiving an API key.
The starting rate limit of a production API key is much larger than the development key:
* 500 requests every 10 seconds
* 30,000 requests every 10 minutes
Remember that this rate limit is enforced per region.
To apply for a production key with an expanded rate limit, click "Register Project" on your dashboard. The process and length of time required to obtain an approved production key can vary depending on your project and the application's target region(s).
Note that the standard production rate limit will meet the needs of the large majority of developers, but it can be expanded if the developer is in good standing, has demonstrated a strong community benefit, and has steadily outgrown the standard production limit.
If you are working on multiple projects, you should register each one separately and each one needs to be individually approved for a separate production API key.
API KEY SECURITY
As a final note on API keys, it's important to mention that your key will likely end up revoked if it isn't properly secured. Securing your API key is a requirement to publishing a project as outlined in the General Policies. If we determine that your key is not secured appropriately, we'll take action to secure it for you. :)
Response Codes
The Riot Games API returns all data in valid JSON. A few programming languages include native support for JSON. For those that don't, you can find a suitable library at https://www.json.org.
Note that our APIs return only non-empty values to save on bandwidth. Zero is considered an empty value, as well as empty strings, empty lists, and nulls. Any numeric field that isn't returned can be assumed to be 0 (or null as you prefer). Any list field that isn't returned can be assumed to be an empty list or null. Any String field that isn't returned can be assumed to be empty string or null.
2XX RESPONSE CODES
* For 200 response codes, you can always expect the response body documented on the API reference page. Only 200 response codes are guaranteed to return a response body as JSON. 
* For non-200 response codes please be aware of the following: 
* A response body is not guaranteed to be returned. 
* If there is a response body, its not guaranteed to be JSON.
* We currently return JSON with human readable debugging information, but the structure and content of this debugging information are subject to change. As an example...
    {
        "status": {
            "message": "Unauthorized",
            "status_code": 401,
        }
    }
The contents of status, message, and status_code are not guaranteed to always exist or remain constant for a given response code. 4. Logic within your application should fail gracefully based the response code alone, and should not rely on the response body.
4XX ERROR CODES
The 4xx class of error codes is meant to indicate that the client failed to provide a valid request. Below are the most common 4xx class of error codes you might encounter when using the API.
400 (Bad Request) This error indicates that there is a syntax error in the request and the request has therefore been denied. The client should not continue to make similar requests without modifying the syntax or the requests being made.
Common Reasons
* A provided parameter is in the wrong format (e.g., a string instead of an integer).
* A provided parameter is invalid (e.g., beginTime and startTime specify a time range that is too large).
* A required parameter was not provided.
401 (Unauthorized) This error indicates that the request being made did not contain the necessary authentication credentials (e.g., an API key) and therefore the client was denied access. The client should not continue to make similar requests without including an API key in the request.
Common Reasons
* An API key has not been included in the request.
403 (Forbidden) This error indicates that the server understood the request but refuses to authorize it. There is no distinction made between an invalid path or invalid authorization credentials (e.g., an API key). The client should not continue to make similar requests.
Common Reasons
* An invalid API key was provided with the API request.
* A blacklisted API key was provided with the API request.
* The API request was for an incorrect or unsupported path.
404 (Not Found) This error indicates that the server has not found a match for the API request being made. No indication is given whether the condition is temporary or permanent.
Common Reasons
* The ID or name provided does not match any existing resource (e.g., there is no Summoner matching the specified ID).
* There are no resources that match the parameters specified.
415 (Unsupported Media Type) This error indicates that the server is refusing to service the request because the body of the request is in a format that is not supported.
Common Reasons
* The Content-Type header was not appropriately set.
429 (Rate Limit Exceeded) This error indicates that the application has exhausted its maximum number of allotted API calls allowed for a given duration. If the client receives a Rate Limit Exceeded response the client should process this response and halt future API calls for the duration, in seconds, indicated by the Retry-After header. Applications that are in violation of this policy may have their access disabled to preserve the integrity of the API. Please refer to our Rate Limiting documentation below for more information on determining if you have been rate limited, and how to avoid it.
Common Reasons
* Unregulated API calls.
5XX ERROR CODES
The 5xx class or error codes indicates that the server is aware it has errored or is incapable of performing the request. Below are the most common 5xx class of error codes you might encounter when using the API.
500 (Internal Server Error) This error indicates an unexpected condition or exception which prevented the server from fulfilling an API request.
503 (Service Unavailable) This error indicates the server is currently unavailable to handle requests because of an unknown reason. The Service Unavailable response implies a temporary condition which will be alleviated after some delay.
Rate Limiting
In order to control the use of the Riot Games API, we set limits on how many times endpoints can be accessed within a given time period. These limits are put in place to minimize abuse, to maintain a high level of stability, and to protect the underlying systems that back the API from being overloaded. The underlying systems are the same systems that power our games, so if they are overloaded, player experience suffers, and our first priority is to protect that experience.
RATE LIMITING TYPES
There are three types of limits used in the API infrastructure - application, method and service rate limits.
Application Rate Limits
The first type of limit is enforced on a per API key basis and is called an application rate limit. App rate limits are enforced per region. Every call made to any Riot Games API endpoint in a given region counts against the app rate limit for that key in that region. For example, calls to the static data API do not count against the application rate limit.
Method Rate Limits
The second type of limit is enforced on a per endpoint (or "method") basis for a given API key and is called a method rate limit. Method rate limits are also enforced per region. Every call made to any Riot Games API endpoint in a given region counts against the method rate limit for the given method and API key in that region.
Service Rate Limits
The third type of limit is enforced on a per service basis and is called a service rate limit. Service rate limits are also enforced per region. Every call made to any endpoint for a given Riot Games API service in a given region counts against the service rate limit for that service in that region. When service rate limits apply, we will document them, including which endpoints are part of the rate limited service.
Do not confuse method rate limits for service rate limits. Method rate limits apply individually to each application. Service rate limits apply to the service, and are shared by all applications making calls to a service.
Other Limits
These limits enforced by the API infrastructure are not the only gateways to the data provided. Some of the underlying services for certain endpoints may also implement their own rate limits, independently of the API infrastructure. In these cases, you will get a 429 error response, but there will be no X-Rate-Limit-Type header included in the response. Only when the rate limiting is enforced by the API edge infrastructure will this header be included.
While it is our policy not to reveal the specifics of how our rate limiting works, you can assume for the purposes of your code that the bucket starts when you make your first API call.
Versioning
As of 2019, these versioning guidelines apply to all Riot Games APIs. However, this may change in the future. Be sure to check documentation for each game you are developing products for to be sure you have the latest information.
Currently, all League of Legends APIs are version 4. We no longer include a minor version in the API path.
Deprecation
As of 2019, these deprecation guidelines apply to all Riot Games APIs. However, this may change in the future. Be sure to check documentation for each game you are developing products for to be sure you have the latest information.
Whenever we deprecate, or make changes to, an API we aim to support both old and new versions of the API for 60 days. After that time the old version is deprecated. At times, circumstances require deprecation periods to be longer or shorter than 60 days. Deprecation periods will be communicated to developers through social media and the Developer Relations blog.
Developers should be careful when developing products with the Riot Games API. If an API is deprecated in favor of an updated version, the previous version will no longer be available. Any calls from a valid API key to a deprecated endpoint will result in an error code.


RIOR DEVELOPER POLICIES
LAST UPDATED: MARCH 11, 2025
Overview
Our goal is to provide developers with a set of tools to create products that will enrich the Riot Games community and provide better player experiences. When working with the Riot Games API and other Developer Tools, we have several conditions set forth in our Terms of Use and Legal Jibber Jabber. Please be sure that you are familiar with those documents prior to developing your product. In addition to those documents, we also provide the following General Policies that all products in the Riot Games third-party ecosystem must adhere to. Failure to meet these policies may result in either suspension or cancellation of your API access or legal recourse.
In order for these policies to best serve the Riot Games ecosystem, they will inevitably change over time. As a result, developers must remain up to date with these policies. Developers are expected to adhere to these policy changes as they arise.
Core Policies
* Products cannot violate any laws
* Do not create or develop games utilizing Riot’s Intellectual Property (IP)
* No cryptocurrencies, no blockchain
* Products cannot closely resemble Riot’s games or products in style or function
* Use the following assets in the development and marketing of your product:
    * Data Dragon
    * Press Kit
        * Using Riot logos, trademarks etc. from the Press Kit must be limited to those cases where such use is inevitable to serve the core value of the product
    * TFT Assets
    * LOR Assets
* You must post the following legal boilerplate to your product in a location that is readily visible to players[Your product] isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.  
Product Registration
* All products must be registered in, and audited by Riot Games through the Developer Portal
    * Any new features or changes to a product must be audited through the product’s page in the Developer Portal
* Products should use supported services from Riot Games for data ingestion
* If your product utilizes the League Client API
    * Read the League Client documentation
    * Register your product through the Developer Portal
Monetization
* Your product cannot feature betting or gambling functionality.
* You may monetize your product as long as your product is registered on the Developer Portal and your product status is either Approved or Acknowledged.
    * You must have a free tier of access for players, which may include advertising
    * Your content must be transformative if you are charging players for it
        * What is transformative? Was value added to the original by creating new information, new aesthetics, new insights, and understandings? If so, then it was transformative.
    * Acceptable ways to charge players are:
        * Subscriptions, donations, or crowdfunding
        * Entry fees for tournaments
        * Currencies that cannot be exchanged back into fiat
    * Your monetization cannot gouge players or be unfair (yes, we get to decide that)
    * If you are unsure if your monetization platform is acceptable, contact us through the Developer Portal
Game Integrity
* Products cannot alter the goal of the game (i.e. Destroy the Nexus).
* Products cannot create an unfair advantage for players, like a cheating program or giving some players an advantage that others would not otherwise have.
* Products should increase, and not decrease the diversity of game decisions (builds, compositions, characters, decks).
* Products should not remove game decisions, but may highlight decisions that are important and give multiple choices to help players make good decisions.
* Products cannot create alternatives for official skill ranking systems such as the ranked ladder. Prohibited alternatives include MMR or ELO calculators.
* Products cannot de-anonymize players who cannot reasonably be identified from visible information.
Tournament Policies
* Tournaments must
    * Follow all monetization policies above
    * Allot at least 70% of the entry fees to the prize pool
    * Win conditions must be fair and transparent to players (we determine fair)
    * Must have at least 20 participants
    * Not include any gambling
* If you are a tournament organizer operating in the US or Canada, please refer to, and adhere to, these North American tournament organizer policies.
* If you are a tournament organizer operating in Europe, please refer to, and adhere to, these European tournament organizer policies.
Developer Safety
* Don't share your Riot Games account information with anyone
* Do not use a Production API key to run multiple projects (one product per key)
* Make sure that you are using SSL/HTTPS when accessing the APIs so that your API key is kept safe.
* Do not include your API key in your code, especially if you plan on distributing a binary
Note that for teams working together on a product, there will be an obvious need to share an API key for your product. Our intention is not to discourage sharing along these lines, but rather sharing with people outside of your organization or who are working on other projects. To properly share an API key within an organization, be sure that your product is owned by a “group” in the Developer Portal, then add additional accounts to that group.


APIs: below are the actual APIs the ones starting with LOL are for League of Legends and the ones starting wirth Val are for Valorant these 2 games only to display everything about the gamer history and make the gamer even able to link more than 1 account in each game and display their stats and they can choose on the new heru profile settings to show it or not show it publicly , their profile becomes like their gamer profile portfolio and bragging with their game account sa and the rank of each account in each game al should have places on the gamer profile : MEMORIZE THESE APIs WELL :

There are three routing values for account-v1; americas, asia, and europe. You can query for any account in any region. We recommend using the nearest cluster.
ACCOUNT-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /riot/account/v1/accounts/by-puuid/{puuid}
        * 		Get account by puuid
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto AccountDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	Encrypted PUUID. Exact length of 78 characters.
gameName	string	This field may be excluded from the response if the account doesn't have a gameName.
tagLine	string	This field may be excluded from the response if the account doesn't have a tagLine.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/accounts/by-puuid/{puuid}
        * 		Get account by puuid - ESPORTS
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
        * 		Get account by riot id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto AccountDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	Encrypted PUUID. Exact length of 78 characters.
gameName	string	This field may be excluded from the response if the account doesn't have a gameName.
tagLine	string	This field may be excluded from the response if the account doesn't have a tagLine.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tagLinerequired		string	When querying for a player by their riot id, the gameName and tagLine query params are required.
gameNamerequired		string	When querying for a player by their riot id, the gameName and tagLine query params are required.
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
        * 		Get account by riot id - ESPORTS
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
gameNamerequired		string	When querying for a player by their riot id, the gameName and tagLine query params are required.
tagLinerequired		string	When querying for a player by their riot id, the gameName and tagLine query params are required.
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid}
        * 		Get active shard for a player
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ActiveShardDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
gamerequired	val                                                                            lor                                                                            2xko	string	
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/region/by-game/{game}/by-puuid/{puuid}
        * 		Get active region (lol and tft)
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountRegionDTO AccountRegionDTO - Account region
NAME	DATA TYPE	DESCRIPTION
puuid	string	Player Universal Unique Identifier. Exact length of 78 characters. (Encrypted)
game	string	Game to lookup active region
region	string	Player active region
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
gamerequired	lol                                                                            tft	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /riot/account/v1/accounts/me
        * 		Get account by access token
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto AccountDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	Encrypted PUUID. Exact length of 78 characters.
gameName	string	This field may be excluded from the response if the account doesn't have a gameName.
tagLine	string	This field may be excluded from the response if the account doesn't have a tagLine.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /riot/account/v1/accounts/me
        * 		Get account by access token - ESPORTS
    * 		 Jump to Inputs RESPONSE CLASSES Return value: AccountDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY      
   
CLASH-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/clash/v1/players/by-puuid/{puuid}
        * 		Get players by puuid
    * 		 Jump to Inputs IMPLEMENTATION NOTES This endpoint returns a list of active Clash players for a given PUUID. If a summoner registers for multiple tournaments at the same time (e.g., Saturday and Sunday) then both registrations would appear in this list.   RESPONSE CLASSES Return value: List[PlayerDto] PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
teamId	string	
position	string	(Legal values: UNSELECTED, FILL, TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
role	string	(Legal values: CAPTAIN, MEMBER)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/clash/v1/teams/{teamId}
        * 		Get team by ID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TeamDto TeamDto
NAME	DATA TYPE	DESCRIPTION
id	string	
tournamentId	int	
name	string	
iconId	int	
tier	int	
captain	string	Summoner ID of the team captain.
abbreviation	string	
players	List[PlayerDto]	Team members.
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
position	string	(Legal values: UNSELECTED, FILL, TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
role	string	(Legal values: CAPTAIN, MEMBER)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
teamIdrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/clash/v1/tournaments
        * 		Get all active or upcoming tournaments.
    * 		 Returns a list of active and upcoming tournaments.   Jump to Inputs RESPONSE CLASSES Return value: List[TournamentDto] TournamentDto
NAME	DATA TYPE	DESCRIPTION
id	int	
themeId	int	
nameKey	string	
nameKeySecondary	string	
schedule	List[TournamentPhaseDto]	Tournament phase.
		 TournamentPhaseDto
NAME	DATA TYPE	DESCRIPTION
id	int	
registrationTime	long	
startTime	long	
cancelled	boolean	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/clash/v1/tournaments/by-team/{teamId}
        * 		Get tournament by team ID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TournamentDto TournamentDto
NAME	DATA TYPE	DESCRIPTION
id	int	
themeId	int	
nameKey	string	
nameKeySecondary	string	
schedule	List[TournamentPhaseDto]	Tournament phase.
		 TournamentPhaseDto
NAME	DATA TYPE	DESCRIPTION
id	int	
registrationTime	long	
startTime	long	
cancelled	boolean	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
teamIdrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/clash/v1/tournaments/{tournamentId}
        * 		Get tournament by ID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TournamentDto TournamentDto
NAME	DATA TYPE	DESCRIPTION
id	int	
themeId	int	
nameKey	string	
nameKeySecondary	string	
schedule	List[TournamentPhaseDto]	Tournament phase.
		 TournamentPhaseDto
NAME	DATA TYPE	DESCRIPTION
id	int	
registrationTime	long	
startTime	long	
cancelled	boolean	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentIdrequired		int	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required    
LOL-CHALLENGES-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/challenges/v1/challenges/config
        * 		List of all basic challenge configuration information (includes all translations for names and descriptions)
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[ChallengeConfigInfoDto] ChallengeConfigInfoDto
NAME	DATA TYPE	DESCRIPTION
id	long	
localizedNames	Map[String, Map[String, string]]	
state	State	
tracking	Tracking	
startTimestamp	long	
endTimestamp	long	
leaderboard	boolean	
thresholds	Map[String, double]	
		 State - DISABLED - not visible and not calculated, HIDDEN - not visible, but calculated, ENABLED - visible and calculated, ARCHIVED - visible, but not calculated
NAME	DATA TYPE	DESCRIPTION
		
    * 		 Tracking - LIFETIME - stats are incremented without reset, SEASON - stats are accumulated by season and reset at the beginning of new season
NAME	DATA TYPE	DESCRIPTION
		
    * 		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/challenges/v1/challenges/percentiles
        * 		Map of level to percentile of players who have achieved it - keys: ChallengeId -> Season -> Level -> percentile of players who achieved it
    * 		 Jump to Inputs RESPONSE CLASSES Return value: Map[Long, Map[Integer, Map[Level, Double]]]   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/challenges/v1/challenges/{challengeId}/config
        * 		Get challenge configuration (REST)
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ChallengeConfigInfoDto ChallengeConfigInfoDto
NAME	DATA TYPE	DESCRIPTION
id	long	
localizedNames	Map[String, Map[String, string]]	
state	State	
tracking	Tracking	
startTimestamp	long	
endTimestamp	long	
leaderboard	boolean	
thresholds	Map[String, double]	
		 State - DISABLED - not visible and not calculated, HIDDEN - not visible, but calculated, ENABLED - visible and calculated, ARCHIVED - visible, but not calculated
NAME	DATA TYPE	DESCRIPTION
		
    * 		 Tracking - LIFETIME - stats are incremented without reset, SEASON - stats are accumulated by season and reset at the beginning of new season
NAME	DATA TYPE	DESCRIPTION
		
    * 		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
challengeIdrequired		long	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level}
        * 		Return top players for each level. Level must be MASTER, GRANDMASTER or CHALLENGER.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[ApexPlayerInfoDto] ApexPlayerInfoDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
value	double	
position	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
levelrequired	NONE                                                                            IRON                                                                            BRONZE                                                                            SILVER                                                                            GOLD                                                                            PLATINUM                                                                            DIAMOND                                                                            MASTER                                                                            GRANDMASTER                                                                            CHALLENGER                                                                            HIGHEST_NOT_LEADERBOARD_ONLY                                                                            HIGHEST                                                                            LOWEST	string	
challengeIdrequired		long	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
limitoptional		int	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/challenges/v1/challenges/{challengeId}/percentiles
        * 		Map of level to percentile of players who have achieved it
    * 		 Jump to Inputs RESPONSE CLASSES Return value: Map[Level, double] Level - 0 NONE, 1 IRON, 2 BRONZE, 3 SILVER, 4 GOLD, 5 PLATINUM, 6 DIAMOND, 7 MASTER, 8 GRANDMASTER, 9 CHALLENGER
NAME	DATA TYPE	DESCRIPTION
		
    * 		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
challengeIdrequired		long	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/challenges/v1/player-data/{puuid}
        * 		Returns player information with list of all progressed challenges (REST)
    * 		 Jump to Inputs RESPONSE CLASSES Return value: PlayerInfoDto PlayerInfoDto
NAME	DATA TYPE	DESCRIPTION
challenges	List[ChallengeInfoDto]	
preferences	PlayerClientPreferencesDto	
totalPoints	ChallengePointDto	
categoryPoints	Map[String, ChallengePointDto]	
		 ChallengeInfoDto
NAME	DATA TYPE	DESCRIPTION
percentile	double	
playersInLevel	int	
achievedTime	long	
value	double	
challengeId	long	
level	string	(Legal values: NONE, IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER, HIGHEST_NOT_LEADERBOARD_ONLY, HIGHEST, LOWEST)
position	int	
		 PlayerClientPreferencesDto
NAME	DATA TYPE	DESCRIPTION
bannerAccent	string	
title	string	
challengeIds	List[string]	
crestBorder	string	
prestigeCrestBorderLevel	int	
		 ChallengePointDto
NAME	DATA TYPE	DESCRIPTION
level	string	
current	long	
max	long	
precentile	long	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     
 

LOL-RSO-MATCH-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/rso-match/v1/matches/ids
        * 		Get a list of match ids by player access token - Includes custom matches
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[string]   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
countoptional	20	int	Defaults to 20. Valid values: 0 to 100. Number of match ids to return.
startoptional	0	int	Defaults to 0. Start index.
typeoptional	ranked                                                                             normal                                                                             tourney                                                                             tutorial	string	Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.
queueoptional		int	Filter the list of match ids by a specific queue id. This filter is mutually inclusive of the type filter meaning any match ids returned must match both the queue and type filters.
endTimeoptional		long	Epoch timestamp in seconds.
startTimeoptional		long	Epoch timestamp in seconds. The matchlist started storing timestamps on June 16th, 2021. Any matches played before June 16th, 2021 won't be included in the results if the startTime filter is set.
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /lol/rso-match/v1/matches/{matchId}
        * 		Get a match by match id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /lol/rso-match/v1/matches/{matchId}/timeline
        * 		Get a match timeline by match id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TimelineDto   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY      

CHAMPION-MASTERY-V4
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}
        * 		Get all champion mastery entries sorted by number of champion points descending.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[ChampionMasteryDto] ChampionMasteryDto - This object contains single Champion Mastery information for player and champion combination.
NAME	DATA TYPE	DESCRIPTION
puuid	string	Player Universal Unique Identifier. Exact length of 78 characters. (Encrypted)
championPointsUntilNextLevel	long	Number of points needed to achieve next level. Zero if player reached maximum champion level for this champion.
chestGranted	boolean	Is chest granted for this champion or not in current season.
championId	long	Champion ID for this entry.
lastPlayTime	long	Last time this champion was played by this player - in Unix milliseconds time format.
championLevel	int	Champion level for specified player and champion combination.
championPoints	int	Total number of champion points for this player and champion combination - they are used to determine championLevel.
championPointsSinceLastLevel	long	Number of points earned since current level has been achieved.
markRequiredForNextLevel	int	
championSeasonMilestone	int	
nextSeasonMilestone	NextSeasonMilestonesDto	
tokensEarned	int	The token earned for this champion at the current championLevel. When the championLevel is advanced the tokensEarned resets to 0.
milestoneGrades	List[string]	
		 NextSeasonMilestonesDto - This object contains required next season milestone information.
NAME	DATA TYPE	DESCRIPTION
requireGradeCounts	object	
rewardMarks	int	Reward marks.
bonus	boolean	Bonus.
rewardConfig	RewardConfigDto	Reward configuration.
		 RewardConfigDto - This object contains required reward config information.
NAME	DATA TYPE	DESCRIPTION
rewardValue	string	Reward value
rewardType	string	Reward type
maximumReward	int	Maximun reward
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
encryptedPUUIDrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId}
        * 		Get a champion mastery by puuid and champion ID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ChampionMasteryDto ChampionMasteryDto - This object contains single Champion Mastery information for player and champion combination.
NAME	DATA TYPE	DESCRIPTION
puuid	string	Player Universal Unique Identifier. Exact length of 78 characters. (Encrypted)
championPointsUntilNextLevel	long	Number of points needed to achieve next level. Zero if player reached maximum champion level for this champion.
chestGranted	boolean	Is chest granted for this champion or not in current season.
championId	long	Champion ID for this entry.
lastPlayTime	long	Last time this champion was played by this player - in Unix milliseconds time format.
championLevel	int	Champion level for specified player and champion combination.
championPoints	int	Total number of champion points for this player and champion combination - they are used to determine championLevel.
championPointsSinceLastLevel	long	Number of points earned since current level has been achieved.
markRequiredForNextLevel	int	
championSeasonMilestone	int	
nextSeasonMilestone	NextSeasonMilestonesDto	
tokensEarned	int	The token earned for this champion at the current championLevel. When the championLevel is advanced the tokensEarned resets to 0.
milestoneGrades	List[string]	
		 NextSeasonMilestonesDto - This object contains required next season milestone information.
NAME	DATA TYPE	DESCRIPTION
requireGradeCounts	object	
rewardMarks	int	Reward marks.
bonus	boolean	Bonus.
rewardConfig	RewardConfigDto	Reward configuration.
		 RewardConfigDto - This object contains required reward config information.
NAME	DATA TYPE	DESCRIPTION
rewardValue	string	Reward value
rewardType	string	Reward type
maximumReward	int	Maximun reward
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
encryptedPUUIDrequired		string	
championIdrequired		integer	Champion ID to retrieve Champion Mastery.
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     

CHAMPION-V3
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/platform/v3/champion-rotations
        * 		Returns champion rotations, including free-to-play and low-level free-to-play rotations (REST)
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ChampionInfo ChampionInfo
NAME	DATA TYPE	DESCRIPTION
maxNewPlayerLevel	int	
freeChampionIdsForNewPlayers	List[int]	
freeChampionIds	List[int]	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     

LEAGUE-EXP-V4
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/league-exp/v4/entries/{queue}/{tier}/{division}
        * 		Get all the league entries.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: Set[LeagueEntryDTO] LeagueEntryDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
summonerId	string	Player's summonerId (Encrypted)
puuid	string	Player's encrypted puuid.
queueType	string	
tier	string	
rank	string	The player's division within a tier.
leaguePoints	int	
wins	int	Winning team on Summoners Rift. First placement in Teamfight Tactics.
losses	int	Losing team on Summoners Rift. Second through eighth placement in Teamfight Tactics.
hotStreak	boolean	
veteran	boolean	
freshBlood	boolean	
inactive	boolean	
miniSeries	MiniSeriesDTO	
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	RANKED_SOLO_5x5                                                                            RANKED_TFT                                                                            RANKED_FLEX_SR                                                                            RANKED_FLEX_TT	string	Note that the queue value must be a valid ranked queue.
tierrequired	CHALLENGER                                                                            GRANDMASTER                                                                            MASTER                                                                            DIAMOND                                                                            EMERALD                                                                            PLATINUM                                                                            GOLD                                                                            SILVER                                                                            BRONZE                                                                            IRON	string	
divisionrequired	I                                                                            II                                                                            III                                                                            IV	string	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
pageoptional	1	int	Defaults to 1. Starts with page 1.
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     



LEAGUE-V4
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/league/v4/challengerleagues/by-queue/{queue}
        * 		Get the challenger league for given queue.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LeagueListDTO LeagueListDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
entries	List[LeagueItemDTO]	
tier	string	
name	string	
queue	string	
		 LeagueItemDTO
NAME	DATA TYPE	DESCRIPTION
freshBlood	boolean	
wins	int	Winning team on Summoners Rift.
miniSeries	MiniSeriesDTO	
inactive	boolean	
veteran	boolean	
hotStreak	boolean	
rank	string	
leaguePoints	int	
losses	int	Losing team on Summoners Rift.
puuid	string	Player's encrypted puuid.
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	RANKED_SOLO_5x5                                                                            RANKED_FLEX_SR                                                                            RANKED_FLEX_TT	string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/league/v4/entries/by-puuid/{encryptedPUUID}
        * 		Get league entries in all queues for a given puuid
    * 		 Jump to Inputs RESPONSE CLASSES Return value: Set[LeagueEntryDTO] LeagueEntryDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
puuid	string	Player's encrypted puuid.
queueType	string	
tier	string	
rank	string	The player's division within a tier.
leaguePoints	int	
wins	int	Winning team on Summoners Rift.
losses	int	Losing team on Summoners Rift.
hotStreak	boolean	
veteran	boolean	
freshBlood	boolean	
inactive	boolean	
miniSeries	MiniSeriesDTO	
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
encryptedPUUIDrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/league/v4/entries/{queue}/{tier}/{division}
        * 		Get all the league entries.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: Set[LeagueEntryDTO] LeagueEntryDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
puuid	string	Player's encrypted puuid.
queueType	string	
tier	string	
rank	string	The player's division within a tier.
leaguePoints	int	
wins	int	Winning team on Summoners Rift.
losses	int	Losing team on Summoners Rift.
hotStreak	boolean	
veteran	boolean	
freshBlood	boolean	
inactive	boolean	
miniSeries	MiniSeriesDTO	
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
divisionrequired	I                                                                            II                                                                            III                                                                            IV	string	
tierrequired	DIAMOND                                                                            EMERALD                                                                            PLATINUM                                                                            GOLD                                                                            SILVER                                                                            BRONZE                                                                            IRON	string	
queuerequired	RANKED_SOLO_5x5                                                                            RANKED_FLEX_SR                                                                            RANKED_FLEX_TT	string	Note that the queue value must be a valid ranked queue.
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
pageoptional	1	int	Defaults to 1. Starts with page 1.
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/league/v4/grandmasterleagues/by-queue/{queue}
        * 		Get the grandmaster league of a specific queue.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LeagueListDTO LeagueListDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
entries	List[LeagueItemDTO]	
tier	string	
name	string	
queue	string	
		 LeagueItemDTO
NAME	DATA TYPE	DESCRIPTION
freshBlood	boolean	
wins	int	Winning team on Summoners Rift.
miniSeries	MiniSeriesDTO	
inactive	boolean	
veteran	boolean	
hotStreak	boolean	
rank	string	
leaguePoints	int	
losses	int	Losing team on Summoners Rift.
puuid	string	Player's encrypted puuid.
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	RANKED_SOLO_5x5                                                                            RANKED_FLEX_SR                                                                            RANKED_FLEX_TT	string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/league/v4/leagues/{leagueId}
        * 		Get league with given ID, including inactive entries.
    * 		 Consistently looking up league ids that don't exist will result in a blacklist.   Jump to Inputs RESPONSE CLASSES Return value: LeagueListDTO LeagueListDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
entries	List[LeagueItemDTO]	
tier	string	
name	string	
queue	string	
		 LeagueItemDTO
NAME	DATA TYPE	DESCRIPTION
freshBlood	boolean	
wins	int	Winning team on Summoners Rift.
miniSeries	MiniSeriesDTO	
inactive	boolean	
veteran	boolean	
hotStreak	boolean	
rank	string	
leaguePoints	int	
losses	int	Losing team on Summoners Rift.
puuid	string	Player's encrypted puuid.
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
leagueIdrequired		string	The UUID of the league.
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/league/v4/masterleagues/by-queue/{queue}
        * 		Get the master league for given queue.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LeagueListDTO LeagueListDTO
NAME	DATA TYPE	DESCRIPTION
leagueId	string	
entries	List[LeagueItemDTO]	
tier	string	
name	string	
queue	string	
		 LeagueItemDTO
NAME	DATA TYPE	DESCRIPTION
freshBlood	boolean	
wins	int	Winning team on Summoners Rift.
miniSeries	MiniSeriesDTO	
inactive	boolean	
veteran	boolean	
hotStreak	boolean	
rank	string	
leaguePoints	int	
losses	int	Losing team on Summoners Rift.
puuid	string	Player's encrypted puuid.
		 MiniSeriesDTO
NAME	DATA TYPE	DESCRIPTION
losses	int	
progress	string	
target	int	
wins	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	RANKED_SOLO_5x5                                                                            RANKED_FLEX_SR                                                                            RANKED_FLEX_TT	string	
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     

LOL-STATUS-V4
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/status/v4/platform-data
        * 		Get League of Legends status for the given platform.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: PlatformDataDto PlatformDataDto
NAME	DATA TYPE	DESCRIPTION
id	string	
name	string	
locales	List[string]	
maintenances	List[StatusDto]	
incidents	List[StatusDto]	
		 StatusDto
NAME	DATA TYPE	DESCRIPTION
id	int	
maintenance_status	string	(Legal values: scheduled, in_progress, complete)
incident_severity	string	(Legal values: info, warning, critical)
titles	List[ContentDto]	
updates	List[UpdateDto]	
created_at	string	
archive_at	string	
updated_at	string	
platforms	List[string]	(Legal values: windows, macos, android, ios, ps4, xbone, switch)
		 ContentDto
NAME	DATA TYPE	DESCRIPTION
locale	string	
content	string	
		 UpdateDto
NAME	DATA TYPE	DESCRIPTION
id	int	
author	string	
publish	boolean	
publish_locations	List[string]	(Legal values: riotclient, riotstatus, game)
translations	List[ContentDto]	
created_at	string	
updated_at	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            PBE1                                                            RU                                                            SG2                                                            TR1                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     
The AMERICAS routing value serves NA, BR, LAN and LAS. The ASIA routing value serves KR and JP. The EUROPE routing value serves EUNE, EUW, ME1, TR and RU. The SEA routing value serves OCE, SG2, TW2 and VN2.  
MATCH-V5
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/match/v5/matches/by-puuid/{puuid}/ids
        * 		Get a list of match ids by puuid
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[string]   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		String	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
startTimeoptional		long	Epoch timestamp in seconds. The matchlist started storing timestamps on June 16th, 2021. Any matches played before June 16th, 2021 won't be included in the results if the startTime filter is set.
endTimeoptional		long	Epoch timestamp in seconds.
queueoptional		int	Filter the list of match ids by a specific queue id. This filter is mutually inclusive of the type filter meaning any match ids returned must match both the queue and type filters.
typeoptional	ranked                                                                             normal                                                                             tourney                                                                             tutorial	string	Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.
startoptional	0	int	Defaults to 0. Start index.
countoptional	20	int	Defaults to 20. Valid values: 0 to 100. Number of match ids to return.
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/match/v5/matches/by-puuid/{puuid}/replays
        * 		Get player replays
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ReplayDTO ReplayDTO
NAME	DATA TYPE	DESCRIPTION
total	int	Total of replay files
matchFileURLs	List[string]	Replay files URL (.rofl)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		string	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/match/v5/matches/{matchId}
        * 		Get a match by match id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchDto MatchDto
NAME	DATA TYPE	DESCRIPTION
metadata	MetadataDto	Match metadata.
info	InfoDto	Match info.
		 MetadataDto
NAME	DATA TYPE	DESCRIPTION
dataVersion	string	Match data version.
matchId	string	Match id.
participants	List[string]	A list of participant PUUIDs.
		 InfoDto
NAME	DATA TYPE	DESCRIPTION
endOfGameResult	string	Refer to indicate if the game ended in termination.
gameCreation	long	Unix timestamp for when the game is created on the game server (i.e., the loading screen).
gameDuration	long	Prior to patch 11.20, this field returns the game length in milliseconds calculated from gameEndTimestamp - gameStartTimestamp. Post patch 11.20, this field returns the max timePlayed of any participant in the game in seconds, which makes the behavior of this field consistent with that of match-v4. The best way to handling the change in this field is to treat the value as milliseconds if the gameEndTimestamp field isn't in the response and to treat the value as seconds if gameEndTimestamp is in the response.
gameEndTimestamp	long	Unix timestamp for when match ends on the game server. This timestamp can occasionally be significantly longer than when the match "ends". The most reliable way of determining the timestamp for the end of the match would be to add the max time played of any participant to the gameStartTimestamp. This field was added to match-v5 in patch 11.20 on Oct 5th, 2021.
gameId	long	
gameMode	string	Refer to the Game Constants documentation.
gameName	string	
gameStartTimestamp	long	Unix timestamp for when match starts on the game server.
gameType	string	
gameVersion	string	The first two parts can be used to determine the patch a game was played on.
mapId	int	Refer to the Game Constants documentation.
participants	List[ParticipantDto]	
platformId	string	Platform where the match was played.
queueId	int	Refer to the Game Constants documentation.
teams	List[TeamDto]	
tournamentCode	string	Tournament code used to generate the match. This field was added to match-v5 in patch 11.13 on June 23rd, 2021.
		 ParticipantDto
NAME	DATA TYPE	DESCRIPTION
allInPings	int	Yellow crossed swords
assistMePings	int	Green flag
assists	int	
baronKills	int	
bountyLevel	int	
champExperience	int	
champLevel	int	
championId	int	Prior to patch 11.4, on Feb 18th, 2021, this field returned invalid championIds. We recommend determining the champion based on the championName field for matches played prior to patch 11.4.
championName	string	
commandPings	int	Blue generic ping (ALT+click)
championTransform	int	This field is currently only utilized for Kayn's transformations. (Legal values: 0 - None, 1 - Slayer, 2 - Assassin)
consumablesPurchased	int	
challenges	ChallengesDto	
damageDealtToBuildings	int	
damageDealtToObjectives	int	
damageDealtToTurrets	int	
damageSelfMitigated	int	
deaths	int	
detectorWardsPlaced	int	
doubleKills	int	
dragonKills	int	
eligibleForProgression	boolean	
enemyMissingPings	int	Yellow questionmark
enemyVisionPings	int	Red eyeball
firstBloodAssist	boolean	
firstBloodKill	boolean	
firstTowerAssist	boolean	
firstTowerKill	boolean	
gameEndedInEarlySurrender	boolean	This is an offshoot of the OneStone challenge. The code checks if a spell with the same instance ID does the final point of damage to at least 2 Champions. It doesn't matter if they're enemies, but you cannot hurt your friends.
gameEndedInSurrender	boolean	
holdPings	int	
getBackPings	int	Yellow circle with horizontal line
goldEarned	int	
goldSpent	int	
individualPosition	string	Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
inhibitorKills	int	
inhibitorTakedowns	int	
inhibitorsLost	int	
item0	int	
item1	int	
item2	int	
item3	int	
item4	int	
item5	int	
item6	int	
itemsPurchased	int	
killingSprees	int	
kills	int	
lane	string	
largestCriticalStrike	int	
largestKillingSpree	int	
largestMultiKill	int	
longestTimeSpentLiving	int	
magicDamageDealt	int	
magicDamageDealtToChampions	int	
magicDamageTaken	int	
missions	MissionsDto	
neutralMinionsKilled	int	neutralMinionsKilled = mNeutralMinionsKilled, which is incremented on kills of kPet and kJungleMonster
needVisionPings	int	Green ward
nexusKills	int	
nexusTakedowns	int	
nexusLost	int	
objectivesStolen	int	
objectivesStolenAssists	int	
onMyWayPings	int	Blue arrow pointing at ground
participantId	int	
playerScore0	int	
playerScore1	int	
playerScore2	int	
playerScore3	int	
playerScore4	int	
playerScore5	int	
playerScore6	int	
playerScore7	int	
playerScore8	int	
playerScore9	int	
playerScore10	int	
playerScore11	int	
pentaKills	int	
perks	PerksDto	
physicalDamageDealt	int	
physicalDamageDealtToChampions	int	
physicalDamageTaken	int	
placement	int	
playerAugment1	int	
playerAugment2	int	
playerAugment3	int	
playerAugment4	int	
playerSubteamId	int	
pushPings	int	Green minion
profileIcon	int	
puuid	string	
quadraKills	int	
riotIdGameName	string	
riotIdTagline	string	
role	string	
sightWardsBoughtInGame	int	
spell1Casts	int	
spell2Casts	int	
spell3Casts	int	
spell4Casts	int	
subteamPlacement	int	
summoner1Casts	int	
summoner1Id	int	
summoner2Casts	int	
summoner2Id	int	
summonerId	string	
summonerLevel	int	
summonerName	string	
teamEarlySurrendered	boolean	
teamId	int	
teamPosition	string	Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
timeCCingOthers	int	
timePlayed	int	
totalAllyJungleMinionsKilled	int	
totalDamageDealt	int	
totalDamageDealtToChampions	int	
totalDamageShieldedOnTeammates	int	
totalDamageTaken	int	
totalEnemyJungleMinionsKilled	int	
totalHeal	int	Whenever positive health is applied (which translates to all heals in the game but not things like regeneration), totalHeal is incremented by the amount of health received. This includes healing enemies, jungle monsters, yourself, etc
totalHealsOnTeammates	int	Whenever positive health is applied (which translates to all heals in the game but not things like regeneration), totalHealsOnTeammates is incremented by the amount of health received. This is post modified, so if you heal someone missing 5 health for 100 you will get +5 totalHealsOnTeammates
totalMinionsKilled	int	totalMillionsKilled = mMinionsKilled, which is only incremented on kills of kTeamMinion, kMeleeLaneMinion, kSuperLaneMinion, kRangedLaneMinion and kSiegeLaneMinion
totalTimeCCDealt	int	
totalTimeSpentDead	int	
totalUnitsHealed	int	
tripleKills	int	
trueDamageDealt	int	
trueDamageDealtToChampions	int	
trueDamageTaken	int	
turretKills	int	
turretTakedowns	int	
turretsLost	int	
unrealKills	int	
visionScore	int	
visionClearedPings	int	
visionWardsBoughtInGame	int	
wardsKilled	int	
wardsPlaced	int	
win	boolean	
		 ChallengesDto - Challenges DTO
NAME	DATA TYPE	DESCRIPTION
12AssistStreakCount	int	
baronBuffGoldAdvantageOverThreshold	int	
controlWardTimeCoverageInRiverOrEnemyHalf	float	
earliestBaron	int	
earliestDragonTakedown	int	
earliestElderDragon	int	
earlyLaningPhaseGoldExpAdvantage	int	
fasterSupportQuestCompletion	int	
fastestLegendary	int	
hadAfkTeammate	int	
highestChampionDamage	int	
highestCrowdControlScore	int	
highestWardKills	int	
junglerKillsEarlyJungle	int	
killsOnLanersEarlyJungleAsJungler	int	
laningPhaseGoldExpAdvantage	int	
legendaryCount	int	
maxCsAdvantageOnLaneOpponent	float	
maxLevelLeadLaneOpponent	int	
mostWardsDestroyedOneSweeper	int	
mythicItemUsed	int	
playedChampSelectPosition	int	
soloTurretsLategame	int	
takedownsFirst25Minutes	int	
teleportTakedowns	int	
thirdInhibitorDestroyedTime	int	
threeWardsOneSweeperCount	int	
visionScoreAdvantageLaneOpponent	float	
InfernalScalePickup	int	
fistBumpParticipation	int	
voidMonsterKill	int	
abilityUses	int	
acesBefore15Minutes	int	
alliedJungleMonsterKills	float	
baronTakedowns	int	
blastConeOppositeOpponentCount	int	
bountyGold	int	
buffsStolen	int	
completeSupportQuestInTime	int	
controlWardsPlaced	int	
damagePerMinute	float	
damageTakenOnTeamPercentage	float	
dancedWithRiftHerald	int	
deathsByEnemyChamps	int	
dodgeSkillShotsSmallWindow	int	
doubleAces	int	
dragonTakedowns	int	
legendaryItemUsed	List[int]	
effectiveHealAndShielding	float	
elderDragonKillsWithOpposingSoul	int	
elderDragonMultikills	int	
enemyChampionImmobilizations	int	
enemyJungleMonsterKills	float	
epicMonsterKillsNearEnemyJungler	int	
epicMonsterKillsWithin30SecondsOfSpawn	int	
epicMonsterSteals	int	
epicMonsterStolenWithoutSmite	int	
firstTurretKilled	int	
firstTurretKilledTime	float	
flawlessAces	int	
fullTeamTakedown	int	
gameLength	float	
getTakedownsInAllLanesEarlyJungleAsLaner	int	
goldPerMinute	float	
hadOpenNexus	int	
immobilizeAndKillWithAlly	int	
initialBuffCount	int	
initialCrabCount	int	
jungleCsBefore10Minutes	float	
junglerTakedownsNearDamagedEpicMonster	int	
kda	float	
killAfterHiddenWithAlly	int	
killedChampTookFullTeamDamageSurvived	int	
killingSprees	int	
killParticipation	float	
killsNearEnemyTurret	int	
killsOnOtherLanesEarlyJungleAsLaner	int	
killsOnRecentlyHealedByAramPack	int	
killsUnderOwnTurret	int	
killsWithHelpFromEpicMonster	int	
knockEnemyIntoTeamAndKill	int	
kTurretsDestroyedBeforePlatesFall	int	
landSkillShotsEarlyGame	int	
laneMinionsFirst10Minutes	int	
lostAnInhibitor	int	
maxKillDeficit	int	
mejaisFullStackInTime	int	
moreEnemyJungleThanOpponent	float	
multiKillOneSpell	int	This is an offshoot of the OneStone challenge. The code checks if a spell with the same instance ID does the final point of damage to at least 2 Champions. It doesn't matter if they're enemies, but you cannot hurt your friends.
multikills	int	
multikillsAfterAggressiveFlash	int	
multiTurretRiftHeraldCount	int	
outerTurretExecutesBefore10Minutes	int	
outnumberedKills	int	
outnumberedNexusKill	int	
perfectDragonSoulsTaken	int	
perfectGame	int	
pickKillWithAlly	int	
poroExplosions	int	
quickCleanse	int	
quickFirstTurret	int	
quickSoloKills	int	
riftHeraldTakedowns	int	
saveAllyFromDeath	int	
scuttleCrabKills	int	
shortestTimeToAceFromFirstTakedown	float	
skillshotsDodged	int	
skillshotsHit	int	
snowballsHit	int	
soloBaronKills	int	
SWARM_DefeatAatrox	int	
SWARM_DefeatBriar	int	
SWARM_DefeatMiniBosses	int	
SWARM_EvolveWeapon	int	
SWARM_Have3Passives	int	
SWARM_KillEnemy	int	
SWARM_PickupGold	float	
SWARM_ReachLevel50	int	
SWARM_Survive15Min	int	
SWARM_WinWith5EvolvedWeapons	int	
soloKills	int	
stealthWardsPlaced	int	
survivedSingleDigitHpCount	int	
survivedThreeImmobilizesInFight	int	
takedownOnFirstTurret	int	
takedowns	int	
takedownsAfterGainingLevelAdvantage	int	
takedownsBeforeJungleMinionSpawn	int	
takedownsFirstXMinutes	int	
takedownsInAlcove	int	
takedownsInEnemyFountain	int	
teamBaronKills	int	
teamDamagePercentage	float	
teamElderDragonKills	int	
teamRiftHeraldKills	int	
tookLargeDamageSurvived	int	
turretPlatesTaken	int	
turretsTakenWithRiftHerald	int	Any player who damages a tower that is destroyed within 30 seconds of a Rift Herald charge will receive credit. A player who does not damage the tower will not receive credit.
turretTakedowns	int	
twentyMinionsIn3SecondsCount	int	
twoWardsOneSweeperCount	int	
unseenRecalls	int	
visionScorePerMinute	float	
wardsGuarded	int	
wardTakedowns	int	
wardTakedownsBefore20M	int	
		 MissionsDto - Missions DTO
NAME	DATA TYPE	DESCRIPTION
playerScore0	int	
playerScore1	int	
playerScore2	int	
playerScore3	int	
playerScore4	int	
playerScore5	int	
playerScore6	int	
playerScore7	int	
playerScore8	int	
playerScore9	int	
playerScore10	int	
playerScore11	int	
		 PerksDto
NAME	DATA TYPE	DESCRIPTION
statPerks	PerkStatsDto	
styles	List[PerkStyleDto]	
		 PerkStatsDto
NAME	DATA TYPE	DESCRIPTION
defense	int	
flex	int	
offense	int	
		 PerkStyleDto
NAME	DATA TYPE	DESCRIPTION
description	string	
selections	List[PerkStyleSelectionDto]	
style	int	
		 PerkStyleSelectionDto
NAME	DATA TYPE	DESCRIPTION
perk	int	
var1	int	
var2	int	
var3	int	
		 TeamDto
NAME	DATA TYPE	DESCRIPTION
bans	List[BanDto]	
objectives	ObjectivesDto	
teamId	int	
win	boolean	
		 BanDto
NAME	DATA TYPE	DESCRIPTION
championId	int	
pickTurn	int	
		 ObjectivesDto
NAME	DATA TYPE	DESCRIPTION
baron	ObjectiveDto	
champion	ObjectiveDto	
dragon	ObjectiveDto	
horde	ObjectiveDto	
inhibitor	ObjectiveDto	
riftHerald	ObjectiveDto	
tower	ObjectiveDto	
		 ObjectiveDto
NAME	DATA TYPE	DESCRIPTION
first	boolean	
kills	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/match/v5/matches/{matchId}/timeline
        * 		Get a match timeline by match id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TimelineDto TimelineDto
NAME	DATA TYPE	DESCRIPTION
metadata	MetadataTimeLineDto	Match metadata.
info	InfoTimeLineDto	Match info.
		 MetadataTimeLineDto
NAME	DATA TYPE	DESCRIPTION
dataVersion	string	Match data version.
matchId	string	Match id.
participants	List[string]	A list of participant PUUIDs.
		 InfoTimeLineDto
NAME	DATA TYPE	DESCRIPTION
endOfGameResult	string	Refer to indicate if the game ended in termination.
frameInterval	long	
gameId	long	
participants	List[ParticipantTimeLineDto]	
frames	List[FramesTimeLineDto]	
		 ParticipantTimeLineDto
NAME	DATA TYPE	DESCRIPTION
participantId	int	
puuid	string	
		 FramesTimeLineDto
NAME	DATA TYPE	DESCRIPTION
events	List[EventsTimeLineDto]	
participantFrames	ParticipantFramesDto	
timestamp	int	
		 EventsTimeLineDto
NAME	DATA TYPE	DESCRIPTION
timestamp	long	
realTimestamp	long	
type	string	
		 ParticipantFramesDto
NAME	DATA TYPE	DESCRIPTION
1-9	ParticipantFrameDto	Key value mapping for each participant
		 ParticipantFrameDto
NAME	DATA TYPE	DESCRIPTION
championStats	ChampionStatsDto	
currentGold	int	
damageStats	DamageStatsDto	
goldPerSecond	int	
jungleMinionsKilled	int	
level	int	
minionsKilled	int	
participantId	int	
position	PositionDto	
timeEnemySpentControlled	int	
totalGold	int	
xp	int	
		 ChampionStatsDto
NAME	DATA TYPE	DESCRIPTION
abilityHaste	int	
abilityPower	int	
armor	int	
armorPen	int	
armorPenPercent	int	
attackDamage	int	
attackSpeed	int	
bonusArmorPenPercent	int	
bonusMagicPenPercent	int	
ccReduction	int	
cooldownReduction	int	
health	int	
healthMax	int	
healthRegen	int	
lifesteal	int	
magicPen	int	
magicPenPercent	int	
magicResist	int	
movementSpeed	int	
omnivamp	int	
physicalVamp	int	
power	int	
powerMax	int	
powerRegen	int	
spellVamp	int	
		 DamageStatsDto
NAME	DATA TYPE	DESCRIPTION
magicDamageDone	int	
magicDamageDoneToChampions	int	
magicDamageTaken	int	
physicalDamageDone	int	
physicalDamageDoneToChampions	int	
physicalDamageTaken	int	
totalDamageDone	int	
totalDamageDoneToChampions	int	
totalDamageTaken	int	
trueDamageDone	int	
trueDamageDoneToChampions	int	
trueDamageTaken	int	
		 PositionDto
NAME	DATA TYPE	DESCRIPTION
x	int	
y	int	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AMERICAS                                                            ASIA                                                            EUROPE                                                            SEA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     

SPECTATOR-V5
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/spectator/v5/active-games/by-summoner/{encryptedPUUID}
        * 		Get current game information for the given puuid.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: CurrentGameInfo CurrentGameInfo
NAME	DATA TYPE	DESCRIPTION
gameId	long	The ID of the game
gameType	string	The game type
gameStartTime	long	The game start time represented in epoch milliseconds
mapId	long	The ID of the map
gameLength	long	The amount of time in seconds that has passed since the game started
platformId	string	The ID of the platform on which the game is being played
gameMode	string	The game mode
bannedChampions	List[BannedChampion]	Banned champion information
gameQueueConfigId	long	The queue type (queue types are documented on the Game Constants page)
observers	Observer	The observer information
participants	List[CurrentGameParticipant]	The participant information
		 BannedChampion
NAME	DATA TYPE	DESCRIPTION
pickTurn	int	The turn during which the champion was banned
championId	long	The ID of the banned champion
teamId	long	The ID of the team that banned the champion
		 Observer
NAME	DATA TYPE	DESCRIPTION
encryptionKey	string	Key used to decrypt the spectator grid game data for playback
		 CurrentGameParticipant
NAME	DATA TYPE	DESCRIPTION
championId	long	The ID of the champion played by this participant
perks	Perks	Perks/Runes Reforged Information
profileIconId	long	The ID of the profile icon used by this participant
bot	boolean	Flag indicating whether or not this participant is a bot
teamId	long	The team ID of this participant, indicating the participant's team
puuid	string	The encrypted puuid of this participant. null when the player is anonym.
spell1Id	long	The ID of the first summoner spell used by this participant
spell2Id	long	The ID of the second summoner spell used by this participant
gameCustomizationObjects	List[GameCustomizationObject]	List of Game Customizations
		 Perks
NAME	DATA TYPE	DESCRIPTION
perkIds	List[long]	IDs of the perks/runes assigned.
perkStyle	long	Primary runes path
perkSubStyle	long	Secondary runes path
		 GameCustomizationObject
NAME	DATA TYPE	DESCRIPTION
category	string	Category identifier for Game Customization
content	string	Game Customization content
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
encryptedPUUIDrequired		string	The puuid of the summoner.
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required        

SUMMONER-V4
* 		Collapse Operations
* 		Expand Operations
    * 		GET /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
        * 		Get a summoner by PUUID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: SummonerDTO SummonerDTO - represents a summoner
NAME	DATA TYPE	DESCRIPTION
profileIconId	int	ID of the summoner icon associated with the summoner.
revisionDate	long	Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: profile icon change, playing the tutorial or advanced tutorial, finishing a game, summoner name change.
puuid	string	Encrypted PUUID. Exact length of 78 characters.
summonerLevel	long	Summoner level associated with the summoner.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
encryptedPUUIDrequired		string	Summoner ID
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/summoner/v4/summoners/me
        * 		Get a summoner by access token.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: SummonerDTO SummonerDTO - represents a summoner
NAME	DATA TYPE	DESCRIPTION
profileIconId	int	ID of the summoner icon associated with the summoner.
revisionDate	long	Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: profile icon change, playing the tutorial or advanced tutorial, finishing a game, summoner name change.
puuid	string	Encrypted PUUID. Exact length of 78 characters.
summonerLevel	long	Summoner level associated with the summoner.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 HEADER PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
Authorizationrequired		string	Bearer token
		 SELECT REGION TO EXECUTE AGAINST                                            BR1                                                            EUN1                                                            EUW1                                                            JP1                                                            KR                                                            LA1                                                            LA2                                                            ME1                                                            NA1                                                            OC1                                                            RU                                                            SG2                                                            TR1                                                            TW2                                                            VN2                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     
YOUR DEVELOPMENT API KEY HAS EXPIRED!

TOURNAMENT-V5
* 		Collapse Operations
* 		Expand Operations
    * 		POST /lol/tournament/v5/codes
        * 		Create a tournament code for the given tournament.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[string]   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentIdrequired		long	The tournament ID
countoptional		int	The number of codes to create (max 1000)
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
TournamentCodeParametersV5required		TournamentCodeParametersV5{
		  "allowedParticipants": {},
		  "enoughPlayers": true,
		  "mapType": "",
		  "metadata": "",
		  "pickType": "",
		  "spectatorType": "",
		  "teamSize": 0
		}	Metadata for the generated code
		 TournamentCodeParametersV5
NAME	DATA TYPE	DESCRIPTION
allowedParticipants	Set[string]	Optional list of encrypted puuids in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future.
metadata	string	Optional string that may contain any data in any format, if specified at all. Used to denote any custom information about the game.
teamSize	int	The team size of the game. Valid values are 1-5.
pickType	string	The pick type of the game. (Legal values: BLIND_PICK, DRAFT_MODE, ALL_RANDOM, TOURNAMENT_DRAFT)
mapType	string	The map type of the game. (Legal values: SUMMONERS_RIFT, HOWLING_ABYSS)
spectatorType	string	The spectator type of the game. (Legal values: NONE, LOBBYONLY, ALL)
enoughPlayers	boolean	Checks if allowed participants are enough to make full teams.
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /lol/tournament/v5/codes/{tournamentCode}
        * 		Returns the tournament code DTO associated with a tournament code string.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TournamentCodeV5DTO TournamentCodeV5DTO
NAME	DATA TYPE	DESCRIPTION
id	int	The tournament code's ID.
providerId	int	The provider's ID.
tournamentId	int	The tournament's ID.
code	string	The tournament code.
region	string	The tournament code's region. (Legal values: BR, EUNE, EUW, JP, LAN, LAS, NA, OCE, PBE, RU, TR, KR, PH, SG, TH, TW, VN)
map	string	The game map for the tournament code game
teamSize	int	The team size for the tournament code game.
spectators	string	The spectator mode for the tournament code game.
pickType	string	The pick mode for tournament code game.
lobbyName	string	The lobby name for the tournament code game.
password	string	The password for the tournament code game.
metaData	string	The metadata for tournament code.
participants	Set[string]	The puuids of the participants (Encrypted)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	The tournament code string.
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		PUT /lol/tournament/v5/codes/{tournamentCode}
        * 		Update the pick type, map, spectator type, or allowed puuids for a code.
    * 		 Jump to Inputs RESPONSE CLASSES    RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	The tournament code to update
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
TournamentCodeUpdateParametersV5optional		TournamentCodeUpdateParametersV5{
		  "allowedParticipants": {},
		  "mapType": "",
		  "pickType": "",
		  "spectatorType": ""
		}	The fields to update
		 TournamentCodeUpdateParametersV5
NAME	DATA TYPE	DESCRIPTION
allowedParticipants	Set[string]	Optional list of encrypted puuids in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future.
pickType	string	The pick type (Legal values: BLIND_PICK, DRAFT_MODE, ALL_RANDOM, TOURNAMENT_DRAFT)
mapType	string	The map type (Legal values: SUMMONERS_RIFT, HOWLING_ABYSS)
spectatorType	string	The spectator type (Legal values: NONE, LOBBYONLY, ALL)
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /lol/tournament/v5/games/by-code/{tournamentCode}
        * 		Get games details
    * 		 Jump to Inputs IMPLEMENTATION NOTES Additional endpoint to get tournament games. From this endpoint, you are able to get participants PUUID (the callback doesn't contain this info). You can also use it to check if the game was recorded and validate callbacks. If the endpoint returns the game, it means a callback was attempted. This will only work for tournament codes created after November 10, 2023.   RESPONSE CLASSES Return value: Set[TournamentGamesV5] TournamentGamesV5
NAME	DATA TYPE	DESCRIPTION
startTime	long	
winningTeam	List[TournamentTeamV5]	
losingTeam	List[TournamentTeamV5]	
shortCode	string	Tournament Code
metaData	string	Metadata for the TournamentCode
gameId	long	
gameName	string	
gameType	string	
gameMap	int	Game Map ID
gameMode	string	
region	string	Region of the game
		 TournamentTeamV5
NAME	DATA TYPE	DESCRIPTION
puuid	string	Player Unique UUID (Encrypted)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /lol/tournament/v5/lobby-events/by-code/{tournamentCode}
        * 		Gets a list of lobby events by tournament code.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LobbyEventV5DTOWrapper LobbyEventV5DTOWrapper
NAME	DATA TYPE	DESCRIPTION
eventList	List[LobbyEventV5DTO]	
		 LobbyEventV5DTO
NAME	DATA TYPE	DESCRIPTION
timestamp	string	Timestamp from the event
eventType	string	The type of event that was triggered
puuid	string	The puuid that triggered the event (Encrypted)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	The short code to look up lobby events for
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		POST /lol/tournament/v5/providers
        * 		Creates a tournament provider and returns its ID.
    * 		 Jump to Inputs IMPLEMENTATION NOTES Providers will need to call this endpoint first to register their callback URL and their API key with the tournament system before any other tournament provider endpoints will work.   RESPONSE CLASSES Return value: int   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
ProviderRegistrationParametersV5required		ProviderRegistrationParametersV5{
		  "region": "",
		  "url": ""
		}	The provider definition.
		 ProviderRegistrationParametersV5
NAME	DATA TYPE	DESCRIPTION
region	string	The region in which the provider will be running tournaments. (Legal values: BR, EUNE, EUW, JP, LAN, LAS, NA, OCE, PBE, RU, TR, KR, PH, SG, TH, TW, VN)
url	string	The provider's callback URL to which tournament game results in this region should be posted. The URL must be well-formed, use the http or https protocol, and use the default port for the protocol (http URLs must use port 80, https URLs must use port 443).
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		POST /lol/tournament/v5/tournaments
        * 		Creates a tournament and returns its ID.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: int   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
TournamentRegistrationParametersV5required		TournamentRegistrationParametersV5{
		  "name": "",
		  "providerId": 0
		}	The tournament definition.
		 TournamentRegistrationParametersV5
NAME	DATA TYPE	DESCRIPTION
providerId	int	The provider ID to specify the regional registered provider data to associate this tournament.
name	string	The optional name of the tournament.
		 INCLUDE API KEY (?)  Query Param  Header Param  Not required     

TOURNAMENT-STUB-V5
* 		Collapse Operations
* 		Expand Operations
    * 		POST /lol/tournament-stub/v5/codes
        * 		Create a tournament code for the given tournament - Stub method
    * 		 Jump to Inputs RESPONSE CLASSES Return value: List[string]   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
countoptional		int	The number of codes to create (max 1000)
tournamentIdrequired		long	The tournament ID
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
TournamentCodeParametersV5required		TournamentCodeParametersV5{
		  "allowedParticipants": {},
		  "enoughPlayers": true,
		  "mapType": "",
		  "metadata": "",
		  "pickType": "",
		  "spectatorType": "",
		  "teamSize": 0
		}	Metadata for the generated code
		 TournamentCodeParametersV5
NAME	DATA TYPE	DESCRIPTION
allowedParticipants	Set[string]	Optional list of encrypted puuids in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future.
metadata	string	Optional string that may contain any data in any format, if specified at all. Used to denote any custom information about the game.
teamSize	int	The team size of the game. Valid values are 1-5.
pickType	string	The pick type of the game. (Legal values: BLIND_PICK, DRAFT_MODE, ALL_RANDOM, TOURNAMENT_DRAFT)
mapType	string	The map type of the game. (Legal values: SUMMONERS_RIFT, HOWLING_ABYSS)
spectatorType	string	The spectator type of the game. (Legal values: NONE, LOBBYONLY, ALL)
enoughPlayers	boolean	Checks if allowed participants are enough to make full teams.
		 SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/tournament-stub/v5/codes/{tournamentCode}
        * 		Returns the tournament code DTO associated with a tournament code string - Stub Method
    * 		 Jump to Inputs RESPONSE CLASSES Return value: TournamentCodeV5DTO TournamentCodeV5DTO
NAME	DATA TYPE	DESCRIPTION
code	string	The tournament code.
lobbyName	string	The lobby name for the tournament code game.
metaData	string	The metadata for tournament code.
password	string	The password for the tournament code game.
teamSize	int	The team size for the tournament code game.
providerId	int	The provider's ID.
pickType	string	The pick mode for tournament code game.
tournamentId	int	The tournament's ID.
id	int	The tournament code's ID.
region	string	The tournament code's region. (Legal values: BR, EUNE, EUW, JP, LAN, LAS, NA, OCE, PBE, RU, TR, KR)
map	string	The game map for the tournament code game
participants	Set[string]	The puuids of the participants (Encrypted)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	The tournament code string.
		 SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		GET /lol/tournament-stub/v5/lobby-events/by-code/{tournamentCode}
        * 		Gets a list of lobby events by tournament code - Stub method
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LobbyEventV5DTOWrapper LobbyEventV5DTOWrapper
NAME	DATA TYPE	DESCRIPTION
eventList	List[LobbyEventV5DTO]	
		 LobbyEventV5DTO
NAME	DATA TYPE	DESCRIPTION
timestamp	string	Timestamp from the event
eventType	string	The type of event that was triggered
puuid	string	The puuid that triggered the event (Encrypted)
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
tournamentCoderequired		string	The short code to look up lobby events for
		 SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		POST /lol/tournament-stub/v5/providers
        * 		Creates a tournament provider and returns its ID - Stub method
    * 		 Jump to Inputs IMPLEMENTATION NOTES Providers will need to call this endpoint first to register their callback URL and their API key with the tournament system before any other tournament provider endpoints will work.   RESPONSE CLASSES Return value: int   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
ProviderRegistrationParametersV5required		ProviderRegistrationParametersV5{
		  "region": "",
		  "url": ""
		}	The provider definition.
		 ProviderRegistrationParametersV5
NAME	DATA TYPE	DESCRIPTION
region	string	The region in which the provider will be running tournaments. (Legal values: BR, EUNE, EUW, JP, LAN, LAS, NA, OCE, PBE, RU, TR, KR)
url	string	The provider's callback URL to which tournament game results in this region should be posted. The URL must be well-formed, use the http or https protocol, and use the default port for the protocol (http URLs must use port 80, https URLs must use port 443).
		 SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required         
    * 		POST /lol/tournament-stub/v5/tournaments
        * 		Creates a tournament and returns its ID - Stub method
    * 		 Jump to Inputs RESPONSE CLASSES Return value: int   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 BODY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
TournamentRegistrationParametersV5required		TournamentRegistrationParametersV5{
		  "name": "",
		  "providerId": 0
		}	The tournament definition.
		 TournamentRegistrationParametersV5
NAME	DATA TYPE	DESCRIPTION
providerId	int	The provider ID to specify the regional registered provider data to associate this tournament.
name	string	The optional name of the tournament.
		 SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     
VAL-CONSOLE-MATCH-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/match/console/v1/matches/{matchId}
        * 		Get match by id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchDto MatchDto
NAME	DATA TYPE	DESCRIPTION
matchInfo	MatchInfoDto	
players	List[PlayerDto]	
coaches	List[CoachDto]	
teams	List[TeamDto]	
roundResults	List[RoundResultDto]	
		 MatchInfoDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
mapId	string	
gameLengthMillis	int	
gameStartMillis	long	
provisioningFlowId	string	
isCompleted	boolean	
customGameName	string	
queueId	string	
gameMode	string	
isRanked	boolean	
seasonId	string	
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
gameName	string	
tagLine	string	
teamId	string	
partyId	string	
characterId	string	
stats	PlayerStatsDto	
competitiveTier	int	
playerCard	string	
playerTitle	string	
		 PlayerStatsDto
NAME	DATA TYPE	DESCRIPTION
score	int	
roundsPlayed	int	
kills	int	
deaths	int	
assists	int	
playtimeMillis	int	
abilityCasts	AbilityCastsDto	
		 AbilityCastsDto
NAME	DATA TYPE	DESCRIPTION
grenadeCasts	int	
ability1Casts	int	
ability2Casts	int	
ultimateCasts	int	
		 CoachDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
teamId	string	
		 TeamDto
NAME	DATA TYPE	DESCRIPTION
teamId	string	This is an arbitrary string. Red and Blue in bomb modes. The puuid of the player in deathmatch.
won	boolean	
roundsPlayed	int	
roundsWon	int	
numPoints	int	Team points scored. Number of kills in deathmatch.
		 RoundResultDto
NAME	DATA TYPE	DESCRIPTION
roundNum	int	
roundResult	string	
roundCeremony	string	
winningTeam	string	
bombPlanter	string	PUUID of player
bombDefuser	string	PUUID of player
plantRoundTime	int	
plantPlayerLocations	List[PlayerLocationsDto]	
plantLocation	LocationDto	
plantSite	string	
defuseRoundTime	int	
defusePlayerLocations	List[PlayerLocationsDto]	
defuseLocation	LocationDto	
playerStats	List[PlayerRoundStatsDto]	
roundResultCode	string	
		 PlayerLocationsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
viewRadians	float	
location	LocationDto	
		 LocationDto
NAME	DATA TYPE	DESCRIPTION
x	int	
y	int	
		 PlayerRoundStatsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
kills	List[KillDto]	
damage	List[DamageDto]	
score	int	
economy	EconomyDto	
ability	AbilityDto	
		 KillDto
NAME	DATA TYPE	DESCRIPTION
timeSinceGameStartMillis	int	
timeSinceRoundStartMillis	int	
killer	string	PUUID
victim	string	PUUID
victimLocation	LocationDto	
assistants	List[string]	List of PUUIDs
playerLocations	List[PlayerLocationsDto]	
finishingDamage	FinishingDamageDto	
		 FinishingDamageDto
NAME	DATA TYPE	DESCRIPTION
damageType	string	
damageItem	string	
isSecondaryFireMode	boolean	
		 DamageDto
NAME	DATA TYPE	DESCRIPTION
receiver	string	PUUID
damage	int	
legshots	int	
bodyshots	int	
headshots	int	
		 EconomyDto
NAME	DATA TYPE	DESCRIPTION
loadoutValue	int	
weapon	string	
armor	string	
remaining	int	
spent	int	
		 AbilityDto
NAME	DATA TYPE	DESCRIPTION
grenadeEffects	string	
ability1Effects	string	
ability2Effects	string	
ultimateEffects	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/console/v1/matchlists/by-puuid/{puuid}
        * 		Get matchlist for games played by puuid and platform type
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchlistDto MatchlistDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
history	List[MatchlistEntryDto]	
		 MatchlistEntryDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
gameStartTimeMillis	long	
queueId	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		String	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
platformTyperequired	playstation                                                                             xbox	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/console/v1/recent-matches/by-queue/{queue}
        * 		Get recent matches
    * 		 Jump to Inputs IMPLEMENTATION NOTES Returns a list of match ids that have completed in the last 10 minutes for live regions and 12 hours for the esports routing value. NA/LATAM/BR share a match history deployment. As such, recent matches will return a combined list of matches from those three regions. Requests are load balanced so you may see some inconsistencies as matches are added/removed from the list.   RESPONSE CLASSES Return value: RecentMatchesDto RecentMatchesDto
NAME	DATA TYPE	DESCRIPTION
currentTime	long	
matchIds	List[string]	A list of recent match ids.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	console_unrated                                                                             console_swiftplay                                                                             console_hurm                                                                             console_deathmatch                                                                             console_competitive	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required     
VAL-CONSOLE-MATCH-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/match/console/v1/matches/{matchId}
        * 		Get match by id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchDto MatchDto
NAME	DATA TYPE	DESCRIPTION
matchInfo	MatchInfoDto	
players	List[PlayerDto]	
coaches	List[CoachDto]	
teams	List[TeamDto]	
roundResults	List[RoundResultDto]	
		 MatchInfoDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
mapId	string	
gameLengthMillis	int	
gameStartMillis	long	
provisioningFlowId	string	
isCompleted	boolean	
customGameName	string	
queueId	string	
gameMode	string	
isRanked	boolean	
seasonId	string	
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
gameName	string	
tagLine	string	
teamId	string	
partyId	string	
characterId	string	
stats	PlayerStatsDto	
competitiveTier	int	
playerCard	string	
playerTitle	string	
		 PlayerStatsDto
NAME	DATA TYPE	DESCRIPTION
score	int	
roundsPlayed	int	
kills	int	
deaths	int	
assists	int	
playtimeMillis	int	
abilityCasts	AbilityCastsDto	
		 AbilityCastsDto
NAME	DATA TYPE	DESCRIPTION
grenadeCasts	int	
ability1Casts	int	
ability2Casts	int	
ultimateCasts	int	
		 CoachDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
teamId	string	
		 TeamDto
NAME	DATA TYPE	DESCRIPTION
teamId	string	This is an arbitrary string. Red and Blue in bomb modes. The puuid of the player in deathmatch.
won	boolean	
roundsPlayed	int	
roundsWon	int	
numPoints	int	Team points scored. Number of kills in deathmatch.
		 RoundResultDto
NAME	DATA TYPE	DESCRIPTION
roundNum	int	
roundResult	string	
roundCeremony	string	
winningTeam	string	
bombPlanter	string	PUUID of player
bombDefuser	string	PUUID of player
plantRoundTime	int	
plantPlayerLocations	List[PlayerLocationsDto]	
plantLocation	LocationDto	
plantSite	string	
defuseRoundTime	int	
defusePlayerLocations	List[PlayerLocationsDto]	
defuseLocation	LocationDto	
playerStats	List[PlayerRoundStatsDto]	
roundResultCode	string	
		 PlayerLocationsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
viewRadians	float	
location	LocationDto	
		 LocationDto
NAME	DATA TYPE	DESCRIPTION
x	int	
y	int	
		 PlayerRoundStatsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
kills	List[KillDto]	
damage	List[DamageDto]	
score	int	
economy	EconomyDto	
ability	AbilityDto	
		 KillDto
NAME	DATA TYPE	DESCRIPTION
timeSinceGameStartMillis	int	
timeSinceRoundStartMillis	int	
killer	string	PUUID
victim	string	PUUID
victimLocation	LocationDto	
assistants	List[string]	List of PUUIDs
playerLocations	List[PlayerLocationsDto]	
finishingDamage	FinishingDamageDto	
		 FinishingDamageDto
NAME	DATA TYPE	DESCRIPTION
damageType	string	
damageItem	string	
isSecondaryFireMode	boolean	
		 DamageDto
NAME	DATA TYPE	DESCRIPTION
receiver	string	PUUID
damage	int	
legshots	int	
bodyshots	int	
headshots	int	
		 EconomyDto
NAME	DATA TYPE	DESCRIPTION
loadoutValue	int	
weapon	string	
armor	string	
remaining	int	
spent	int	
		 AbilityDto
NAME	DATA TYPE	DESCRIPTION
grenadeEffects	string	
ability1Effects	string	
ability2Effects	string	
ultimateEffects	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/console/v1/matchlists/by-puuid/{puuid}
        * 		Get matchlist for games played by puuid and platform type
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchlistDto MatchlistDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
history	List[MatchlistEntryDto]	
		 MatchlistEntryDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
gameStartTimeMillis	long	
queueId	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		String	
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
platformTyperequired	playstation                                                                             xbox	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/console/v1/recent-matches/by-queue/{queue}
        * 		Get recent matches
    * 		 Jump to Inputs IMPLEMENTATION NOTES Returns a list of match ids that have completed in the last 10 minutes for live regions and 12 hours for the esports routing value. NA/LATAM/BR share a match history deployment. As such, recent matches will return a combined list of matches from those three regions. Requests are load balanced so you may see some inconsistencies as matches are added/removed from the list.   RESPONSE CLASSES Return value: RecentMatchesDto RecentMatchesDto
NAME	DATA TYPE	DESCRIPTION
currentTime	long	
matchIds	List[string]	A list of recent match ids.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	console_unrated                                                                             console_swiftplay                                                                             console_hurm                                                                             console_deathmatch                                                                             console_competitive	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required     
VAL-CONSOLE-RANKED-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/console/ranked/v1/leaderboards/by-act/{actId}
        * 		Get leaderboard for the competitive queue
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LeaderboardDto LeaderboardDto
NAME	DATA TYPE	DESCRIPTION
actId	string	The act id for the given leaderboard. Act ids can be found using the val-content API.
totalPlayers	long	The total number of players in the leaderboard.
query	string	
shard	string	The shard for the given leaderboard.
players	List[PlayerDto]	
tierDetails	List[TierDto]	
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	This field may be omitted if the player has been anonymized.
gameName	string	This field may be omitted if the player has been anonymized.
tagLine	string	This field may be omitted if the player has been anonymized.
leaderboardRank	long	
rankedRating	long	
numberOfWins	long	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
actIdrequired		string	Act ids can be found using the val-content API.
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
platformTyperequired	playstation                                                                             xbox	string	
startIndexoptional	0	int	Defaults to 0.
sizeoptional	200	int	Defaults to 200. Valid values: 1 to 200.
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            EU                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required     
VAL-CONTENT-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/content/v1/contents
        * 		Get content optionally filtered by locale
    * 		 Jump to Inputs RESPONSE CLASSES Return value: ContentDto ContentDto
NAME	DATA TYPE	DESCRIPTION
version	string	
characters	List[ContentItemDto]	
maps	List[ContentItemDto]	
chromas	List[ContentItemDto]	
skins	List[ContentItemDto]	
skinLevels	List[ContentItemDto]	
equips	List[ContentItemDto]	
gameModes	List[ContentItemDto]	
sprays	List[ContentItemDto]	
sprayLevels	List[ContentItemDto]	
charms	List[ContentItemDto]	
charmLevels	List[ContentItemDto]	
playerCards	List[ContentItemDto]	
playerTitles	List[ContentItemDto]	
acts	List[ActDto]	
		 ContentItemDto
NAME	DATA TYPE	DESCRIPTION
name	string	
localizedNames	LocalizedNamesDto	This field is excluded from the response when a locale is set
id	string	
assetName	string	
assetPath	string	This field is only included for maps and game modes. These values are used in the match response.
		 LocalizedNamesDto
NAME	DATA TYPE	DESCRIPTION
ar-AE	string	
de-DE	string	
en-GB	string	
en-US	string	
es-ES	string	
es-MX	string	
fr-FR	string	
id-ID	string	
it-IT	string	
ja-JP	string	
ko-KR	string	
pl-PL	string	
pt-BR	string	
ru-RU	string	
th-TH	string	
tr-TR	string	
vi-VN	string	
zh-CN	string	
zh-TW	string	
		 ActDto
NAME	DATA TYPE	DESCRIPTION
name	string	
localizedNames	LocalizedNamesDto	This field is excluded from the response when a locale is set
id	string	
isActive	boolean	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
localeoptional		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            ESPORTS                                                            EU                                                            KR                                                            LATAM                                                            NA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required     
VAL-MATCH-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/match/v1/matches/{matchId}
        * 		Get match by id
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchDto MatchDto
NAME	DATA TYPE	DESCRIPTION
matchInfo	MatchInfoDto	
players	List[PlayerDto]	
coaches	List[CoachDto]	
teams	List[TeamDto]	
roundResults	List[RoundResultDto]	
		 MatchInfoDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
mapId	string	
gameVersion	string	
gameLengthMillis	int	
region	string	
gameStartMillis	long	
provisioningFlowId	string	
isCompleted	boolean	
customGameName	string	
queueId	string	
gameMode	string	
isRanked	boolean	
seasonId	string	
premierMatchInfo	List[PremierMatchDto]	
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
gameName	string	
tagLine	string	
teamId	string	
partyId	string	
characterId	string	
stats	PlayerStatsDto	
competitiveTier	int	
isObserver	boolean	
playerCard	string	
playerTitle	string	
accountLevel	int	
		 PlayerStatsDto
NAME	DATA TYPE	DESCRIPTION
score	int	
roundsPlayed	int	
kills	int	
deaths	int	
assists	int	
playtimeMillis	int	
abilityCasts	AbilityCastsDto	
		 AbilityCastsDto
NAME	DATA TYPE	DESCRIPTION
grenadeCasts	int	
ability1Casts	int	
ability2Casts	int	
ultimateCasts	int	
		 CoachDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
teamId	string	
		 TeamDto
NAME	DATA TYPE	DESCRIPTION
teamId	string	This is an arbitrary string. Red and Blue in bomb modes. The puuid of the player in deathmatch.
won	boolean	
roundsPlayed	int	
roundsWon	int	
numPoints	int	Team points scored. Number of kills in deathmatch.
		 RoundResultDto
NAME	DATA TYPE	DESCRIPTION
roundNum	int	
roundResult	string	
roundCeremony	string	
winningTeam	string	
winningTeamRole	string	
bombPlanter	string	PUUID of player
bombDefuser	string	PUUID of player
plantRoundTime	int	
plantPlayerLocations	List[PlayerLocationsDto]	
plantLocation	LocationDto	
plantSite	string	
defuseRoundTime	int	
defusePlayerLocations	List[PlayerLocationsDto]	
defuseLocation	LocationDto	
playerStats	List[PlayerRoundStatsDto]	
roundResultCode	string	
		 PlayerLocationsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
viewRadians	float	
location	LocationDto	
		 LocationDto
NAME	DATA TYPE	DESCRIPTION
x	int	
y	int	
		 PlayerRoundStatsDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
kills	List[KillDto]	
damage	List[DamageDto]	
score	int	
economy	EconomyDto	
ability	AbilityDto	
		 KillDto
NAME	DATA TYPE	DESCRIPTION
timeSinceGameStartMillis	int	
timeSinceRoundStartMillis	int	
killer	string	PUUID
victim	string	PUUID
victimLocation	LocationDto	
assistants	List[string]	List of PUUIDs
playerLocations	List[PlayerLocationsDto]	
finishingDamage	FinishingDamageDto	
		 FinishingDamageDto
NAME	DATA TYPE	DESCRIPTION
damageType	string	
damageItem	string	
isSecondaryFireMode	boolean	
		 DamageDto
NAME	DATA TYPE	DESCRIPTION
receiver	string	PUUID
damage	int	
legshots	int	
bodyshots	int	
headshots	int	
		 EconomyDto
NAME	DATA TYPE	DESCRIPTION
loadoutValue	int	
weapon	string	
armor	string	
remaining	int	
spent	int	
		 AbilityDto
NAME	DATA TYPE	DESCRIPTION
grenadeEffects	string	
ability1Effects	string	
ability2Effects	string	
ultimateEffects	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
matchIdrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            ESPORTS                                                            EU                                                            KR                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/v1/matchlists/by-puuid/{puuid}
        * 		Get matchlist for games played by puuid
    * 		 Jump to Inputs RESPONSE CLASSES Return value: MatchlistDto MatchlistDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	
history	List[MatchlistEntryDto]	
		 MatchlistEntryDto
NAME	DATA TYPE	DESCRIPTION
matchId	string	
gameStartTimeMillis	long	
queueId	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
puuidrequired		String	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            ESPORTS                                                            EU                                                            KR                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required  CANNOT EXECUTE. THIS API ENDPOINT IS NOT AVAILABLE IN YOUR POLICY       
    * 		GET /val/match/v1/recent-matches/by-queue/{queue}
        * 		Get recent matches
    * 		 Jump to Inputs IMPLEMENTATION NOTES Returns a list of match ids that have completed in the last 10 minutes for live regions and 12 hours for the esports routing value. NA/LATAM/BR share a match history deployment. As such, recent matches will return a combined list of matches from those three regions. Requests are load balanced so you may see some inconsistencies as matches are added/removed from the list.   RESPONSE CLASSES Return value: RecentMatchesDto RecentMatchesDto
NAME	DATA TYPE	DESCRIPTION
currentTime	long	
matchIds	List[string]	A list of recent match ids.
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
queuerequired	competitive                                                                             unrated                                                                             spikerush                                                                             tournamentmode                                                                             deathmatch                                                                             onefa                                                                             ggteam                                                                             hurm                                                                             swiftplay                                                                             dodgeball                                                                             skirmish1v1                                                                             skirmish2v2	string	
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            ESPORTS                                                            EU                                                            KR                                                            LATAM                                                            NA                                        INCLUDE API KEY (?)  Query Param  Header Param  Not required 

VAL-RANKED-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/ranked/v1/leaderboards/by-act/{actId}
        * 		Get leaderboard for the competitive queue
    * 		 Jump to Inputs RESPONSE CLASSES Return value: LeaderboardDto LeaderboardDto
NAME	DATA TYPE	DESCRIPTION
shard	string	The shard for the given leaderboard.
actId	string	The act id for the given leaderboard. Act ids can be found using the val-content API.
totalPlayers	long	The total number of players in the leaderboard.
players	List[PlayerDto]	
		 PlayerDto
NAME	DATA TYPE	DESCRIPTION
puuid	string	This field may be omitted if the player has been anonymized.
gameName	string	This field may be omitted if the player has been anonymized.
tagLine	string	This field may be omitted if the player has been anonymized.
leaderboardRank	long	
rankedRating	long	
numberOfWins	long	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 PATH PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
actIdrequired		string	Act ids can be found using the val-content API.
		 QUERY PARAMETERS
NAME	VALUE	DATA TYPE	DESCRIPTION
sizeoptional	200	int	Defaults to 200. Valid values: 1 to 200.
startIndexoptional	0	int	Defaults to 0.
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            KR                                                            LATAM                                                            NA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required      
    
VAL-STATUS-V1
* 		Collapse Operations
* 		Expand Operations
    * 		GET /val/status/v1/platform-data
        * 		Get VALORANT status for the given platform.
    * 		 Jump to Inputs RESPONSE CLASSES Return value: PlatformDataDto PlatformDataDto
NAME	DATA TYPE	DESCRIPTION
id	string	
name	string	
locales	List[string]	
maintenances	List[StatusDto]	
incidents	List[StatusDto]	
		 StatusDto
NAME	DATA TYPE	DESCRIPTION
id	int	
maintenance_status	string	(Legal values: scheduled, in_progress, complete)
incident_severity	string	(Legal values: info, warning, critical)
titles	List[ContentDto]	
updates	List[UpdateDto]	
created_at	string	
archive_at	string	
updated_at	string	
platforms	List[string]	(Legal values: windows, macos, android, ios, ps4, xbone, switch)
		 ContentDto
NAME	DATA TYPE	DESCRIPTION
locale	string	
content	string	
		 UpdateDto
NAME	DATA TYPE	DESCRIPTION
id	int	
author	string	
publish	boolean	
publish_locations	List[string]	(Legal values: riotclient, riotstatus, game)
translations	List[ContentDto]	
created_at	string	
updated_at	string	
		   RESPONSE ERRORS
HTTP STATUS CODE	REASON
400	Bad request
401	Unauthorized
403	Forbidden
404	Data not found
405	Method not allowed
415	Unsupported media type
429	Rate limit exceeded
500	Internal server error
502	Bad gateway
503	Service unavailable
504	Gateway timeout
		 SELECT REGION TO EXECUTE AGAINST                                            AP                                                            BR                                                            EU                                                            KR                                                            LATAM                                                            NA                                        SELECT APP TO EXECUTE AGAINST                                              Development API Key                                      INCLUDE API KEY (?)  Query Param  Header Param  Not required      
