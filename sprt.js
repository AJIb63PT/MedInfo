( function() {

const tab = document.querySelector('#ctl00_plate_gr_fs');
const counter = tab.querySelectorAll('tr').length;
const heads = tab.querySelectorAll('tr')[0].querySelectorAll('th');

const keys = [];
heads.forEach(e=> keys.push(e.innerHTML));
const vals=[];
const json=[];

for (let index = 1; index <= counter-1; index++) {
    const elements = tab.querySelectorAll('tr')[index].querySelectorAll('td');
    const obj={}
    keys.forEach((a,i)=>obj[a]=elements[i].innerText)
    json.push(obj)
}

console.log(json);

const name1 ='Международное непатентованное или группировочное или химическое наименование';
(function(console){
 
    console.save = function(data, filename){
 
        if(!data) {
            console.error('Console.save: No data')
            return;
        }
 
        if(!filename) filename = 'console.json'
 
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }
 
        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
 
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)
console.save(json, `${json[0][name1]}.json`)
    
})()


