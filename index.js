const puppeteer = require("puppeteer");
const fs = require('fs');

async function start() {
    const rawdata = fs.readFileSync('mnns.json');
    const re = /\s*'\s*/;
    let startJson = null;
    let oldResultJson = null;
    let noResultJson = null;
  
    try {
      startJson= fs.readFileSync('stopPoint.json');
    } catch (err) {}
    try {
      oldResultJson= fs.readFileSync('oldResult.json');
    } catch (err) {}
    try {
      noResultJson= fs.readFileSync('noResult.json');
    } catch (err) {}

    const list = JSON.parse(rawdata);
    const startPoint = JSON.parse(startJson);
    const oldResult = JSON.parse(oldResultJson);
    const OldnoResult = JSON.parse(noResultJson);
    const noResult = OldnoResult && OldnoResult.length ? [...OldnoResult]:[];
    let result = oldResult && oldResult.length ? [...oldResult]:[];
    console.log(startPoint);
    console.log(result.length);
  
    const browser = await puppeteer.launch();

    for (let inde = startPoint ? startPoint.name[1]+1 : 0; inde < list.length; inde++) {
        const page = await browser.newPage();
        const name = list[inde];
        console.log(name);
    
        await page.goto(`https://grls.rosminzdrav.ru/GRLS.aspx?RegNumber=&MnnR=${name}&lf=&TradeNmR=&OwnerName=&MnfOrg=&MnfOrgCountry=&isfs=0&order=RegDate&orderType=desc&RegType=1%2c6&pageSize=10&pageNum=1`);
        const pages = await page.evaluate(()=>{
            const allVitSpan = document.querySelector('#ctl00_plate_lrecn');
            if(!allVitSpan) return
            const allVitNum = allVitSpan.innerText;
            const numEl = parseInt(allVitNum.match(/\d+/))
            const btns = Math.ceil(numEl/10)  
            return btns
        })
        if(!pages) {
          noResult.push(name);
        }

        for (let ind = 1; ind <= pages; ind++) {
            if(!pages) return

            await page.goto(`https://grls.rosminzdrav.ru/GRLS.aspx?RegNumber=&MnnR=${name}&lf=&TradeNmR=&OwnerName=&MnfOrg=&MnfOrgCountry=&isfs=0&order=RegDate&orderType=desc&RegType=1%2c6&pageSize=10&pageNum=${ind}`);

            const trs = await page.evaluate(() => {
                const table = document.querySelector('.qa-result-table')
                const trs = table.querySelectorAll('tr');
                const trrer = []
                trs.forEach(tr=>{
                    if(tr.getAttribute('onclick')){
                        trrer.push(tr.getAttribute('onclick'))
                    }
                })
                return trrer
            });

            for (let index = 0; index < trs.length; index++) {
                await page.goto(`https://grls.rosminzdrav.ru/Grls_View_v2.aspx?routingGuid=${trs[index].split(re)[1]}`)
                let info =  await page.evaluate(() => {
                    const tab = document.querySelector('#ctl00_plate_gr_fs');
                    const tradeName = document.querySelector('#ctl00_plate_TradeNmR').getAttribute('value');
                    if(tab) {
                        const counter = tab.querySelectorAll('tr').length;
                        const heads = tab.querySelectorAll('tr')[0].querySelectorAll('th');
                      
                        const keys = [];
                        heads.forEach(e=> keys.push(e.innerHTML));
                        const json = [];
                  
                        for (let i = 1; i <= counter-1; i++) {
                            const elements = tab.querySelectorAll('tr')[i].querySelectorAll('td');
                            const obj = {};
                            keys.forEach((a,i) => obj[a] = elements[i].innerText);
                            obj['Торг. наим.'] = tradeName;
                            json.push(obj);
                        }
                        return json
                    }
                });
              
                if(info) {
                    if(result.length) {
                        result=[...result,...info]
                    } else{
                        result=[...info]
                    }
                }
            }
        }

        console.log(result);

        const data = JSON.stringify(result);
        fs.writeFileSync('oldResult.json', data);

        const NOdata = JSON.stringify(noResult);
        fs.writeFileSync('noResult.json', NOdata);

        const stopPoint = JSON.stringify({name:[name,inde]});
        fs.writeFileSync('stopPoint.json', stopPoint);
    }
    await browser.close();
}
start();
