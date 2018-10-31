const puppeteer = require('puppeteer');
var fs = require('fs');
const Axios = require('axios')
const args = require('yargs').argv;
const mkdirp = require('mkdirp');

var username;
var password;
var HANDLESS = true;
var firstRun = true

if(args.onlyCLI != "" && args.onlyCLI != null){
  HANDLESS = args.onlyCLI;
}

const GLOBAL_CONFIG = {ignoreHTTPSErrors:true, headless: true};

const USERNAME_SELECTOR = '#login-email';
const PASSWORD_SELECTOR = '#password';
const BUTTON_SELECTOR = 'body > div.container > section > section.signin > form > button';

var URL_COURSE;

var QUEUE_AULAS = [];
var COUNT_AULAS = 0;
var TOTAL_AULAS = 0;

var QUEUE_ATIVIDADES = [];
var QUEUE_TIPO_ATIVIDADES = [];
var COUNT_ATIVIDADES = 0;
var TOTAL_ATIVIDADES = 0;

var LIST_VIDEOS = [];
var COUNT_VIDEOS = 0
var TOTAL_VIDEOS = 0;

var OPERATION_MODE;
var COUNT_OPERATION;
var LIST_OPERATION = [];
var TOTAL_OPERATION;

function slugfy (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:; ";
  var to   = "aaaaaeeeeiiiioooouuuunc-------";

  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

  return str;
}


async function saveState(){

  var fs = require('fs');

  await fs.unlink('saveState.db', (err) => {
    //if (err) throw err;
  });

  await fs.unlink('QUEUE_AULAS.db', (err) => {
    //if (err) throw err;
  });

  await fs.unlink('QUEUE_TIPO_ATIVIDADES.db', (err) => {
    //if (err) throw err;
  });

  await fs.unlink('QUEUE_ATIVIDADES.db', (err) => {
    //if (err) throw err;
  });
  await fs.unlink('LIST_OPERATION.db', (err) => {
    //if (err) throw err;
  });

  console.log("[STATUS]: Salvando estado da aplicação")
  await fs.writeFile("saveState.db", COUNT_AULAS+"|"+TOTAL_AULAS+"|"+COUNT_ATIVIDADES+"|"+TOTAL_ATIVIDADES+"|"+COUNT_OPERATION+"|"+TOTAL_OPERATION+"|"+TOTAL_ESCRITAS, function(erro) {

      if(erro) {
          throw erro;
      }
      //console.log("[STATUS]: SAVESTATE.DB salvo com sucesso");
  }); 

 /* for(var i in QUEUE_AULAS){
    await fs.appendFile('QUEUE_AULAS.db', QUEUE_AULAS[i]+"\r\n", function (err) {
      if (err) {
        console.log("[ERROR]: SAVE_STATE(QUEUE_AULAS): "+ err);
      } else {
       // console.log("[STATUS]: QUEUE_AULAS salvo com sucesso");
      }
    })
  }

  for(var i in QUEUE_ATIVIDADES){
    await fs.appendFile('QUEUE_ATIVIDADES.db', QUEUE_ATIVIDADES[i]+"|"+QUEUE_TIPO_ATIVIDADES[i]+"\r\n", function (err) {
      if (err) {
        console.log("[ERROR]: SAVE_STATE(QUEUE_ATIVIDADES): "+ err);
      } else {
        //console.log("[STATUS]: QUEUE_ATIVIDADES salvo com sucesso");
      }
    })
  }

  for(var i in LIST_OPERATION){
     await fs.appendFile('LIST_OPERATION.db', LIST_OPERATION[i]+"\r\n", function (err) {
      if (err) {
        console.log("[ERROR]: SAVE_STATE(LIST_OPERATION): "+ err);
      } else {
        //console.log("[STATUS]: LIST_OPERATION salvo com sucesso");
      }
    })
  }*/

}


async function run() {
  QUEUE_AULAS = [];
  COUNT_AULAS = 0;
  TOTAL_AULAS = 0;

  QUEUE_ATIVIDADES = [];
  QUEUE_TIPO_ATIVIDADES = [];

  COUNT_ATIVIDADES = 0;
  TOTAL_ATIVIDADES = 0;
  TOTAL_ESCRITAS = 0;

  LIST_VIDEOS = [];
  COUNT_VIDEOS = 0
  TOTAL_VIDEOS = 0;

  if(args.snapshot == 1 && firstRun == true){
    var saveState = require('readline').createInterface({
      input: require('fs').createReadStream('saveState.db')
    });
    
    saveState.on('line', function (line) {
      var db = line.split("|")
      console.log('[STATUS]: Recuperando estado anterior...')

      COUNT_AULAS = db[0];
     /* TOTAL_AULAS = db[1];
      COUNT_ATIVIDADES = db[2];
      TOTAL_ATIVIDADES = db[3]; 
      COUNT_OPERATION = db[4];
      TOTAL_OPERATION = db[5];
      TOTAL_ESCRITAS = db[6];*/
      
      console.log('COUNT_AULAS: '+ COUNT_AULAS);
      /*console.log('TOTAL_AULAS: '+ TOTAL_AULAS);
      console.log('COUNT_ATIVIDADES: '+ COUNT_ATIVIDADES);
      console.log('TOTAL_ATIVIDADES: '+ TOTAL_ATIVIDADES);
      console.log('COUNT_OPERATION: '+ COUNT_OPERATION);
      console.log('TOTAL_OPERATION: '+ TOTAL_OPERATION);
      console.log('TOTAL_ESCRITAS: ' + TOTAL_ESCRITAS);*/

    });

   /*var QUEUE_AULAS_DB = require('readline').createInterface({
      input: require('fs').createReadStream('QUEUE_AULAS.db')
    });

    QUEUE_AULAS_DB.on('line', function (line) {
      QUEUE_AULAS.push(line);
    });

    var QUEUE_TIPO_ATIVIDADES_DB = require('readline').createInterface({
      input: require('fs').createReadStream('QUEUE_AULAS.db')
    });

    QUEUE_TIPO_ATIVIDADES_DB.on('line', function (line) {
      QUEUE_TIPO_ATIVIDADES.push(line);
    });

    var QUEUE_ATIVIDADES_DB = require('readline').createInterface({
      input: require('fs').createReadStream('QUEUE_AULAS.db')
    });

    QUEUE_ATIVIDADES_DB.on('line', function (line) {
      QUEUE_ATIVIDADES.push(line);
    });

    var LIST_OPERATION_DB = require('readline').createInterface({
      input: require('fs').createReadStream('QUEUE_AULAS.db')
    });

    LIST_OPERATION_DB.on('line', function (line) {
      LIST_OPERATION.push(line);
    });*/
    firstRun = false;
    scrap_aulas();
  }else{
    scrap_aulas();
  }

  
}

async function scrap_aulas(){
  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  

  if(OPERATION_MODE == 'single'){
    await page.goto(args.course, {waitUntil: 'domcontentloaded'});
    URL_COURSE = args.course;
  }else if(OPERATION_MODE == 'list'){
    await page.goto(LIST_OPERATION[COUNT_OPERATION], {waitUntil: 'domcontentloaded'});
    URL_COURSE = LIST_OPERATION[COUNT_OPERATION];
    
    COUNT_OPERATION++;
    saveState();
  }

  console.log("[STATUS]: Acessando a página do curso: " + URL_COURSE);
  
  try{
    await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
      console.log('[WARNING] : URL TIMEOUT - Falha ao obter conteudo da pagina, tentando novamente...');
      //scrap_video();
    });
  }catch(e){
    scrap_aulas();
  } 

  console.log("[STATUS]: Capturando lista de aulas...");

  const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('div.course-content-sectionList > ul > li > a[href]'), ({ href }) => href)
  );
  
  for(var i in hrefs) {
    QUEUE_AULAS.push(hrefs[i]);
  }
  TOTAL_AULAS = QUEUE_AULAS.length;
  console.log('[STATUS]: Total de Aulas encontradas: ' + TOTAL_AULAS);

  browser.close();
  scrap_atividades();
}

async function scrap_atividades(){
  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  console.log('[STATUS]: Acessando aula: ' + QUEUE_AULAS[COUNT_AULAS]);

  await page.goto(QUEUE_AULAS[COUNT_AULAS], {waitUntil: 'domcontentloaded'});

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);

  console.log("[STATUS]: Tentando fazer login...");
  await page.click(BUTTON_SELECTOR);

  try{
    await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
      console.log('[WARNING]: URL TIMEOUT - Tentando obter conteudo da pagina...');
      //scrap_video();
    });
  }catch(e){
    scrap_atividades();
  }
  

  console.log('[STATUS]: Capturando lista de atividades da aula...');

  let atividades = await page.evaluate((sel) => {
    return Array.from(document.getElementsByClassName(sel)).map(node => node.href);
  }, 'task-menu-nav-item-link')

  let tipo_atividades = await page.evaluate((sel) => {
    return Array.from(document.getElementsByClassName(sel)).map(node => node.className);
  }, 'task-menu-nav-item-link')

  for(var i in atividades) {
    QUEUE_ATIVIDADES.push(atividades[i]);
    QUEUE_TIPO_ATIVIDADES.push(tipo_atividades[i]);
    //console.log(atividades[i]);
  }

  TOTAL_ATIVIDADES = QUEUE_ATIVIDADES.length;
  console.log('[STATUS]: Total deatividades encontradas: ' + TOTAL_ATIVIDADES);

  browser.close();
  scrap_video();

  if(COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
    COUNT_AULAS++;
    saveState();
    //QUEUE_AULAS = [];
  }

}

async function scrap_video(){

  const browser = await puppeteer.launch(GLOBAL_CONFIG); //Without proxy
  //const browser = await puppeteer.launch({args:[ '--proxy-server=http://contwebprd17:82',], ignoreHTTPSErrors:true, headless: false});
  const page = await browser.newPage();

  if(COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
    COUNT_AULAS++;
    saveState();
    scrap_atividades();
    
  }else{
    console.log('[STATUS]: Acessando aula: ' + QUEUE_ATIVIDADES[COUNT_ATIVIDADES]);

    await page.goto(QUEUE_ATIVIDADES[COUNT_ATIVIDADES], {waitUntil: 'domcontentloaded'});

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(password);

    console.log("[STATUS]: Tentando fazer login...");
    await page.click(BUTTON_SELECTOR);


    if(QUEUE_TIPO_ATIVIDADES[COUNT_ATIVIDADES] == "task-menu-nav-item-link task-menu-nav-item-link-VIDEO"){
      console.log('[STATUS]: Obtendo o URL do vídeo...');

      try{
        await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
          console.log('[WARNING]: URL TIMEOUT Tentando pegar conteudo da página...');
        });
      }catch(e){
        scrap_video();
      }
    
      try {
        const video = await page.evaluate(() => document.querySelector('#video-player-frame_html5_api > source:nth-child(1)').src);
        LIST_VIDEOS.push(video);
        console.log("[STATUS]: Video encontrado "+video);
  
        var final_name = video.split('/')[4];
  
        real_aula = COUNT_AULAS + 1;
  
        real_atividades = COUNT_ATIVIDADES + 1;
  
        var file_path = __dirname+"/downloads/"+URL_COURSE.split('/')[4]+"/Aula-"+real_aula;
  
        mkdirp(file_path, function(err) {});
  
        var path = file_path+"/atividade-"+real_atividades+"-"+final_name.split('=')[5];
  
        console.log("[STATUS]: Baixando Video: " + final_name.split('=')[5]);
        
        await downloadVideo(path, video);
  
        await browser.close();
       
      } catch (e) {
        console.log('[ERROR] : Não foi possivel obter o vídeo, tentando novamente... ');
        await browser.close();
      }
    }else{//Aqui é caso a atividade seja um texto ou outra coisa que não seja vídeo
      try{
        await page.waitForNavigation({timeout:50000}).then(()=>{},()=>{
          console.log('[WARNING]: URL TIMEOUT Tentando pegar conteudo da página...');
        });
      }catch(e){
      }
    
      try {
        
        const title = await page.evaluate(() => document.querySelector('.task-body-header-title-text').innerHTML);

        const html = await page.evaluate(() => document.querySelector('.task-body').innerHTML);
  
        real_aula = COUNT_AULAS + 1;
  
        real_atividades = COUNT_ATIVIDADES + 1;

        var final_name = "atividade-"+real_atividades+"-"+slugfy(title);
  
        var file_path = __dirname+"/downloads/"+URL_COURSE.split('/')[4]+"/Aula-"+real_aula;
        //console.log(html)
  
        mkdirp(file_path, function(err) {if(err){console.log(err)}});
  
        var path = file_path+"/"+final_name;
  
        console.log("[STATUS]: Baixando HTML: " + final_name);

        await fs.writeFile(encodeURI(path)+".html", html, function(erro) {

          if(erro) {
              console.log(erro);
              scrap_video();
          }
    
          console.log("[STATUS]: Arquivo HTML Salvo com sucesso");
          COUNT_ATIVIDADES++;
          saveState();
        }); 
  
        await browser.close();
       
      } catch (e) {
        console.log('[ERROR] : Não foi possivel obter o HTML, tentando novamente... ');
      }
    }
        var FIX_TOTAL_AULAS = TOTAL_AULAS - 1; //Fixa total de aulas de acordo com contagem do array, evitando sobra de 1 elemento.
        
        console.log('[STATUS]: CURSOS:'+COUNT_OPERATION+'/'+TOTAL_OPERATION+' ATIVIDADES: '+COUNT_ATIVIDADES+'/'+TOTAL_ATIVIDADES + ' AULAS: '+COUNT_AULAS+'/'+TOTAL_AULAS);
        
        if(COUNT_AULAS >= FIX_TOTAL_AULAS && COUNT_ATIVIDADES >= TOTAL_ATIVIDADES){
            if(OPERATION_MODE == 'single'){
              console.log('[STATUS]: Nada para fazer, tarefas concluidas!');
              process.exit();        
            }else if(OPERATION_MODE == 'list'){
              if(COUNT_OPERATION >= TOTAL_OPERATION){
                console.log('[STATUS]: Nada para fazer, tarefas concluidas!');
                process.exit();   
              }else{
                run();
              }
            }
        }else{
          scrap_video();
        }

    
  }

}

async function downloadVideo(path, url) {
  // axios image download with response type "stream"
  const response = await Axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  // pipe the result stream into a file on disc
  response.data.pipe(fs.createWriteStream(path))

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      COUNT_ATIVIDADES++;
      saveState();
      resolve()
    })

    response.data.on('error', () => {
      reject()
    })
  })
}

//run();

function helper(){
  console.log('Você esqueceu de definir algum argumento...')
  console.log('Use por exemplo:')
  console.log('node scrap.js --username=eu@email.com ');
  console.log('              --pass="123" ');
  console.log('              --mode=single or list');
  console.log('              --course=https://cursos.alura.com.br/course/android-...');
  console.log('              OR');
  console.log('              --course=listOfCourses.txt');
  console.log('              --snapshot=1');
  console.log('              --onlyCLI=true');
}



'use strict';


async function get_args(){
  if(args.username == null || args.username == "" || args.username == 'undefinied' || args.pass == null || args.pass == "" || args.pass == 'undefinied' || args.mode == null || args.mode == "" || args.mode == 'undefinied'){
    helper();
  }else{
      console.log('[STATUS]: Definindo usuario: ' + args.username);  
      console.log('[STATUS]: Definindo senha: ' + args.pass); 
      console.log('[STATUS]: Definindo alvo: ' + args.course); 
      
      URL_COURSE = args.course;
      username = args.username;
      password = args.pass;
  
      if(args.mode == 'single'){
        console.log('[STATUS]: Selecionado modo para apenas um curso');
        run();
      }else if(args.mode == 'list'){
        console.log('[STATUS]: Selecionado modo para lista de cursos');
  
        var lineReader = require('readline').createInterface({
          input: fs.createReadStream(args.course)
        });
        
        await lineReader.on('line', function (line) {
          LIST_OPERATION.push(line.toString());
        }).on('close', function() {
          console.log('[STATUS]: Lista carregada com sucesso');
          TOTAL_OPERATION = LIST_OPERATION.length;
          COUNT_OPERATION = 0;
          OPERATION_MODE = args.mode;
          run();
        });
  
       
      }else{
        helper();
      }
      //run();
  }
}
get_args();

