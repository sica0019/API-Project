/* globals APIKEY */
let codeHandler = (function (){

const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];
let searchString = "";
let searchResultsDiv = document.querySelector("#search-results");
let recommendResultsDiv = document.querySelector("#recommend-results");

document.addEventListener("DOMContentLoaded", init);

function init() {
    /*console.log(APIKEY);*/
    addEventListeners();
    getDataFromLocalStorage();


    searchResultsDiv.classList.add("hide");
    recommendResultsDiv.classList.add("hide");



}

function addEventListeners() {

    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);
    document.getElementById("search-input").addEventListener("keydown", (ev) => {
        if (ev.keyCode == 13) {
            startSearch();
        }
    })

    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let optionList = document.getElementsByName("video");
        let optionType = null;
        for (let i = 0; i < optionList.length; i++) {
            if (optionList[i].checked) {
                optionType = optionList[i].value;
                break;
            }
        }

        console.log("You picked " + optionType);
        hideOverlay(e);
    });

    document.querySelector(".settingsButtonDiv").addEventListener("click", showOverlay);
    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
    document.querySelector(".overlay").addEventListener("click", hideOverlay);

}

function getDataFromLocalStorage() {
    /*Check if image secure base URL and sizes array are saved in local storage. If not call getPosterURLAndSizes.*/

    //if in local storage check if saved over 60 minutes ago, if true call getPosterURLAndSizes

    //in local storage AND < 60 minutes old, load and use from local storage.

    getPosterURLAndSizes();
}

function getPosterURLAndSizes() {

    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;

        })
        .catch(function (error) {
            alert(error);
        })
}

function startSearch() {
    searchString = document.getElementById("search-input").value;
    if (!searchString) {
        alert("Please enter search data");
        document.getElementById("search-input").focus();
        return;
    }
    searchResultsDiv.classList.remove("hide");

    // this is a new search so you should reset any existing page data

    getSearchResults();
}

function getSearchResults() {

    let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;

    fetch(url)
        .then((response) => response.json())
        .then(function (data) {
            nextPage(data);
            console.log(data);
        })
        .catch((error) => alert(error));

}

function nextPage(data) {
    let title = document.querySelector("#search-results>.title");
    let content = document.querySelector("#search-results>.content");
    let info = document.createElement("h3");

    title.innerHTML = '';
    content.innerHTML = '';

    if (data.total_results === 0) {
        info.textContent = "No results found for " + searchString;
    } else {
        info.textContent = `We found 1-${data.results.length} out of ${data.total_results} for ${searchString}`;
    }
    title.appendChild(info);

    let documentFragment = new DocumentFragment();
    documentFragment.appendChild(movieCards(data.results));
    content.appendChild(documentFragment);



    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });

}

function movieCards(data) {
    let documentFragment = new DocumentFragment();
    data.forEach(function (movie) {
        let movieCardDiv = document.createElement("div");
        let movieCardSec = document.createElement("section");
        let movieImg = document.createElement("img");
        let movieTitle = document.createElement("h4");
        let movieReleaseDate = document.createElement("p");
        let movieRating = document.createElement("p");
        let movieDescription = document.createElement("p");

        movieDescription.textContent = movie.overview;
        movieRating.textContent = movie.vote_average;
        movieReleaseDate.textContent = movie.release_date;
        movieTitle.textContent = movie.title;
        movieImg.src = `${imageURL}${imageSizes[1]}${movie.poster_path}`;

        movieCardDiv.appendChild(movieCardSec);
        movieCardDiv.appendChild(movieImg);
        movieCardDiv.appendChild(movieTitle);
        movieCardDiv.appendChild(movieReleaseDate);
        movieCardDiv.appendChild(movieRating);
        movieCardDiv.appendChild(movieDescription);

        movieCardDiv.setAttribute("data-title", movie.title);
        movieCardDiv.setAttribute("data-id", movie.id);

        movieCardDiv.className = "movieCard";
        movieCardSec.className = "movieImg";

        movieCardSec.appendChild(movieImg);

        documentFragment.appendChild(movieCardDiv);
    })
    return documentFragment;
}

function getRecommendations(e) {
    //console.log(this);
    let movieTitle = this.getAttribute("data-title");

    searchString = movieTitle;

    let movieID = this.getAttribute("data-id");

    let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            console.log(data);

            nextPage(data);
        })

}


function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}

    
})();