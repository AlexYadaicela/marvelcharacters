import '../styles/heroProfiles.css'; 
import CryptoJS from 'crypto-js';

const tabsContainer = document.querySelectorAll('.tab > button'); 
const comicItems = document.querySelectorAll('.comic_item'); 

tabsContainer.forEach((tab) => {
    tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const typeOfData = tab.getAttribute('id'); 
        const numOfData = tab.getAttribute('data-content'); 
        const characterID = document.querySelector('.profile_img').getAttribute('data-characterid');
        
        comicItems.forEach((item) => {
            item.setAttribute('data-visible', 'false'); 
            item.setAttribute('data-available', 'false'); 
            item.classList.add('loading'); 
            item.textContent = '';
        });

        fetchComics(`${typeOfData}`, numOfData, characterID); 
    }) ;
});


const ts = Date.now().toString(); 
const publickey = import.meta.env.VITE_PUBLIC_KEY; 
const privatekey = import.meta.env.VITE_PRIVATE_KEY; 
const hash = CryptoJS.MD5(ts + privatekey + publickey).toString();

async function fetchComics(typeOfData, numOfData, characterID){
    if(Number(numOfData) !== 0){
        try{
            const url = `https://gateway.marvel.com/v1/public/characters/${characterID}/${typeOfData}?ts=${ts}&apikey=${publickey}&hash=${hash}&limit=6`; 
            const response = await fetch (url); 
            if(!response.ok){
                throw new Error(`Response status: ${response.status}`); 
            }
            
            const res = await response.json();
            const comics = res.data.results;
            console.log(comics); 

            comics.forEach((comic, index) => {
                comicItems[index].setAttribute('data-visible', 'true'); 
                comicItems[index].setAttribute('data-available', 'true');
                comicItems[index].style.backgroundImage = `url(${comic.thumbnail.path}.${comic.thumbnail.extension})`; 
            });
        }catch(error){
            console.error(error.message); 
        }
    }
    comicItems.forEach((item) => {
        if(item.getAttribute('data-available') === 'false'){
            item.textContent = 'Nothing found'; 
            item.classList.remove('loading');
        }
    });
}   

export function characterPage(characterDetails){
    const img = `${characterDetails.thumbnail.path}.${characterDetails.thumbnail.extension}`;

    const profileImg = document.querySelector('.profile_img'); 
    profileImg.style.backgroundImage = `url(${img})`;

    profileImg.setAttribute('data-characterID', `${characterDetails.id}`); 

    const descriptionName = document.querySelector('.profile_name'); 
    const descriptionDetail = document.querySelector('.profile_detail'); 

    
    descriptionName.textContent = `${characterDetails.name}`; 

    console.log(characterDetails.name); 

    if(characterDetails.description === ' ' || characterDetails.description === ''){
        descriptionDetail.textContent = 'No description available'; 
    }else{
        descriptionDetail.textContent =  characterDetails.description; 
    }

    // handle links 
    const profileLinks = document.querySelector('.links'); 
    profileLinks.innerHTML = ''; 
    const fragment = document.createDocumentFragment(); 

    const links = characterDetails.urls; 

    links.forEach((link) => {
        const liElement = document.createElement('li');
        const aElement = document.createElement('a');
        aElement.href = `${link.url}`; 
        aElement.textContent = `${link.type}`; 
        aElement.target = '_blank';
        liElement.appendChild(aElement);
        fragment.appendChild(liElement); 
    });

    tabsContainer.forEach((tab) => {
        const dataType = tab.getAttribute('id'); 
        tab.setAttribute('data-content', `${characterDetails[dataType].available}`); 
    });

    profileLinks.appendChild(fragment); 

}

