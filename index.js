//Developed by a.bakedpotato
//I have left comments for what everything does for people who know little to no JS

//Import dependencies
const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');

//Check for stored files, create if they don't exist
const appdata = process.env.APPDATA;
if (!fs.existsSync(appdata + '/a.bakedpotato')) fs.mkdirSync(appdata + '/a.bakedpotato');
if (!fs.existsSync(appdata + '/a.bakedpotato/genshincenter')) fs.mkdirSync(appdata + '/a.bakedpotato/genshincenter');
if (!fs.existsSync(appdata + '/a.bakedpotato/genshincenter/data.json')) fs.writeFileSync(appdata + '/a.bakedpotato/genshincenter/data.json', '{"current":0,"data":{}}');

//Function to replace data and reload page
let window;
async function switchAccount(idx){
	//Load saved data
	let { current, data, options, tz } = JSON.parse(fs.readFileSync(appdata + '/a.bakedpotato/genshincenter/data.json').toString());
	
	//Get gc saved data
	const localStorage = await window.webContents.executeJavaScript('localStorage');
	
	//Save it locally
	data[current] = {
		data: JSON.parse(localStorage.data ?? '[]'),
		inventory: JSON.parse(localStorage.inventory ?? '{}'),
		options: JSON.parse(localStorage.options ?? '{}'),
		tz: localStorage.tz ?? 0
	};
	
	//Swap out gc data with locally stored data
	current = idx;
	await window.webContents.executeJavaScript("localStorage.setItem('data','" + JSON.stringify(data[idx]?.data ?? []) + "')");
	await window.webContents.executeJavaScript("localStorage.setItem('inventory','" + JSON.stringify(data[idx]?.inventory ?? {}) + "')");
	await window.webContents.executeJavaScript("localStorage.setItem('options','" + JSON.stringify(data[idx]?.options ?? {}) + "')");
	await window.webContents.executeJavaScript("localStorage.setItem('tz','" + (data[idx]?.tz ?? 0) + "')");
	
	//Save updated local data
	fs.writeFileSync(appdata + '/a.bakedpotato/genshincenter/data.json', JSON.stringify({ current, data }, null, '\t'));
	
	//Reload page
	await window.webContents.executeJavaScript("window.location.reload()");
	
	//Remove sign in button
	await window.webContents.executeJavaScript("document.getElementsByClassName('MobileHeader_right__1uXcJ')[0].remove()");
}

//Create window + menu
const menu = [
	{
		label: 'Main',
		click: () => switchAccount(0)
	}
];

//Create 10 alt accounts
for (let i = 1; i <= 10; i++){
	menu.push({
		label: i.toString(),
		click: () => switchAccount(i)
	});
}

//Display window to user
app.on('ready', () => {
    window = new BrowserWindow({
		icon: './gc1.png'
	});
	
    window.loadURL('https://genshin-center.com/planner');
	window.webContents.executeJavaScript("document.getElementsByClassName('MobileHeader_right__1uXcJ')[0].remove()");
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});