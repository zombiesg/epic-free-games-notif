/*https://github.com/zombiesg/epic-free-games-notif*/

const { getGames } = require("epic-free-games");
const Database = require("@replit/database");
const moment = require('moment');
const axios = require('axios');
const express = require('express');
const server = express();


const db = new Database()
const send = async () => {
    let lastDate = await db.get("lastDate");
    if (lastDate === null || new Date(lastDate) < new Date()) {
        let res = await getGames("US", true);
        await db.set("lastDate", res.currentGames[0].promotions.promotionalOffers[0].promotionalOffers[0].endDate)
        for (const element of res.currentGames) {
            tempDate = moment.utc(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate).utcOffset("+07:00").format('DD MMMM YYYY hh:mm A');
            let formatTemp = {
                username: "Epic Games Free",
                embeds: [{
                    fields: [{
                            name: element.title,
                            value: element.description
                        },
                        {
                            name: "Offer Ends:",
                            value: tempDate
                        },
						{
                            name: "Link:",
                            value: "https://store.epicgames.com/en-US/"
                        },
                    ],
                    image: {
                        url: element.keyImages[2].url
                    },
                }]
            }
            const res = await axios.post(process.env['webhookLink'],
                JSON.stringify(formatTemp), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

    }
}

const reset = async () => {
	await db.delete("lastDate")
}

server.all('/', async (req, res)=>{
    res.send('hai')
})

server.get('/check', async (req, res)=>{
	await send()
    res.send('ok')
})
server.get('/reset/:pass', async (req, res)=>{
	if(process.env['pass']===req.params.pass){
		await reset()
		res.send('reset')
	}else{
		res.send('fail')
	}
	
})
server.listen(443, ()=>{console.log("Server is Ready!")});

