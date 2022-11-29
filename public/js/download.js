var BLOBS = {}
var DATA
var RETRIES = {}

const startLoading = () => {
    const loader = document.getElementById('overlay_loader')
    loader.classList.remove("hidden")
}
const stopLoading = () => {
    const loader = document.getElementById('overlay_loader')
    loader.classList.add("hidden")
}
const showPageContent = () => {
    const container = document.getElementById("container")
    container.classList.remove('hidden')
}
const renderOverlayErrorMessage = (msg, secondary_msg = null) => {
    const loader = document.getElementById('overlay_loader')
    const loaderContent = loader.querySelector('.overlay__content')

    const child = document.createElement('div')
    child.classList.add("flex", "justify-center", "flex-col", 'items-center')

    child.innerHTML = `
    <svg class="w-24 h-24 mb-8" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xml:space="preserve">
    <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
        <path class="fill-red-300" d="M 85.429 85.078 H 4.571 c -1.832 0 -3.471 -0.947 -4.387 -2.533 c -0.916 -1.586 -0.916 -3.479 0 -5.065 L 40.613 7.455 C 41.529 5.869 43.169 4.922 45 4.922 c 0 0 0 0 0 0 c 1.832 0 3.471 0.947 4.386 2.533 l 40.429 70.025 c 0.916 1.586 0.916 3.479 0.001 5.065 C 88.901 84.131 87.261 85.078 85.429 85.078 z M 45 7.922 c -0.747 0 -1.416 0.386 -1.79 1.033 L 2.782 78.979 c -0.373 0.646 -0.373 1.419 0 2.065 c 0.374 0.647 1.042 1.033 1.789 1.033 h 80.858 c 0.747 0 1.416 -0.387 1.789 -1.033 s 0.373 -1.419 0 -2.065 L 46.789 8.955 C 46.416 8.308 45.747 7.922 45 7.922 L 45 7.922 z M 45 75.325 c -4.105 0 -7.446 -3.34 -7.446 -7.445 s 3.34 -7.445 7.446 -7.445 s 7.445 3.34 7.445 7.445 S 49.106 75.325 45 75.325 z M 45 63.435 c -2.451 0 -4.446 1.994 -4.446 4.445 s 1.995 4.445 4.446 4.445 s 4.445 -1.994 4.445 -4.445 S 47.451 63.435 45 63.435 z M 45 57.146 c -3.794 0 -6.882 -3.087 -6.882 -6.882 V 34.121 c 0 -3.794 3.087 -6.882 6.882 -6.882 c 3.794 0 6.881 3.087 6.881 6.882 v 16.144 C 51.881 54.06 48.794 57.146 45 57.146 z M 45 30.239 c -2.141 0 -3.882 1.741 -3.882 3.882 v 16.144 c 0 2.141 1.741 3.882 3.882 3.882 c 2.14 0 3.881 -1.741 3.881 -3.882 V 34.121 C 48.881 31.98 47.14 30.239 45 30.239 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
    </g>
    </svg>
    `
    child.innerHTML += `<h1 class="text-center text-2xl text-neutral-100">${msg}</h1>`
    if (secondary_msg) {
        child.innerHTML += `<h1 class="text-center text-lg text-neutral-300">${secondary_msg}</h1>`
    }
    child.innerHTML += `<h1 class="text-center text-lg text-blue-300 hover:text-blue-400"><a href="index.html">return to home page</a></h1>`

    loaderContent.replaceChildren(child)
}
const readUrl = () => {
    const url = new URL(window.location.href)
    const targetUrlValue = url.searchParams.get('url')
    if (targetUrlValue === null) {
        renderOverlayErrorMessage("Invalid Video URL.")
        return false
    }
    return (targetUrlValue)
}
const makeRequest = () => {
    const url = readUrl()
    const enpoint = "https://tikwm.com/api/?url="
    if (url) {
        const reuestURL = enpoint + url
        fetch(reuestURL)
            .then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json()
                } else {
                    renderOverlayErrorMessage("Server returned Error code : " + response.status, response.statusText)
                    return null
                }
            })
            .then((data) => processResponse(data))
            .catch((e) => {
                renderOverlayErrorMessage("Error Occurred", e.message)
                throw e
            })
    }
}
const processResponse = (resJSON) => {
    if (!resJSON) { return false }
    const resCode = resJSON['code']
    const resMsg = resJSON['msg']
    if (resCode === -1) {
        renderOverlayErrorMessage("Failed to fetch video.", resMsg)
    } else if (resCode === 0) {
        DATA = resJSON['data']
        getMediaBlobs(resJSON['data'])
        renderPage(resJSON['data'])
        stopLoading()
    }
    else {
        console.error("UNKNOWN RESPONSE CODE.")
        console.log(resJSON)
    }
}
const renderPage = (data) => {
    renderData(data)
    showPageContent()
}
const renderData = (data) => {

    const videoContainer = document.getElementById('video_container')
    const videoField = videoContainer.querySelector('video')

    const videoSourceField = document.getElementById('video_source')
    const authorNameField = document.getElementById('author_name')
    const authorUsernameField = document.getElementById('author_username')
    const authorAvatarField = document.getElementById('author_avatar')
    const authorVideosField = document.getElementById('author_videos')
    // const authorDetailsField = document.getElementById('author_details')
    const videoDownloadField = document.getElementById('video_download')
    const videoDownloadWMField = document.getElementById('video_download_wm')
    const musicDownloadField = document.getElementById('music_download')
    const musicCoverField = document.getElementById('music_cover')
    const musicTitleField = document.getElementById('music_title')
    const musicAuthorField = document.getElementById('music_author')


    const videoSource = data['play']
    const videoPoster = data['origin_cover']
    const authorName = data['author']['nickname']
    const authorUsername = data['author']['unique_id']
    // const authorDetails = data['author']['unique_id']
    const authorAvatar = data['author']['avatar']
    const authorVideos = "https://www.tiktok.com/@" + data['author']['unique_id']
    const videoDownload = data['play']
    const videoDownloadWM = data['wmplay']
    const musicDownload = data['music']
    const musicCover = data["music_info"]['cover']
    const musicTitle = data["music_info"]['title']
    const musicAuthor = data["music_info"]['author']

    const videoTitle = data['title']

    videoSourceField.src = videoSource
    authorNameField.innerText = authorName
    authorUsernameField.innerText = authorUsername
    // authorDetailsField.innerText = KMBFormat()
    authorAvatarField.src = authorAvatar
    authorVideosField.href = authorVideos
    musicCoverField.src = musicCover
    musicTitleField.innerText = musicTitle
    musicAuthorField.innerText = musicAuthor

    const videoElement = `
    <video controls class="rounded-lg h-full w-full" poster="${videoPoster}" style="background-image:url(./assets/pattern.png);">
        <source id="video_source" src="${videoSource}">
    </video>
    `
    videoContainer.replaceChildren()
    videoContainer.insertAdjacentHTML("afterbegin", videoElement)

}
const getMediaBlobs = (data) => {
    console.log("getting media blobs")
    const video = data['play']
    const video_wm = data['wmplay']
    const music = data['music']

    getBlob("video", video)
    getBlob("music", music)
    getBlob("video_wm", video_wm)
}
const getBlob = (blobKey, url) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.responseType = 'blob';
    xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
            console.log('DONE: ', this.status);
            if (this.status == 200) {
                var blob = new Blob([this.response]);
                console.log("got blob " + blobKey)
                BLOBS[blobKey] = blob
            } else {
                console.log("failed to get blob. trying again.")
                !(blobKey in RETRIES) && (RETRIES[blobKey] = 0)
                if (RETRIES[blobKey] < 50) {
                    RETRIES[blobKey]++
                    getBlob(blobKey, url)
                }
            }
        }
    }
    xhr.send()
}
const downloadFileFromBlob = (blobKey, filename, extension) => {
    console.log("downloading blob " + blobKey)
    const blob = BLOBS[blobKey]
    console.log(Boolean(blob))
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.style = "display: none";
    document.body.appendChild(a);
    a.href = url;
    a.download = filename + extension;

    a.click();
    console.log(url)
    // window.URL.revokeObjectURL(url);
    // a.remove()
}
const handleDownloadButtonClick = (button) => {
    console.log("clicked button")
    const blobKey = button.getAttribute('key')
    toggleButtonLoading(button)
    waitForBlobToDownload(blobKey, button)
}
const waitForBlobToDownload = (blobKey, button) => {
    console.log("looking for blob")
    if (!BLOBS.hasOwnProperty(blobKey)) {
        console.log("no blob found. recalling ...")
        setTimeout(waitForBlobToDownload, 100, blobKey, button)
    } else {
        console.log("Found blob")
        let filename = DATA['author']['unique_id'] + "___" + DATA['title'] + "___"
        if (blobKey == "video") {
            filename += "NO_WM"
            var extension = ".mp4"
        } else if (blobKey == "video_wm") {
            filename += "WM"
            var extension = ".mp4"
        } else if (blobKey == "music") {
            filename = DATA["music_info"]['author'] + "___" + DATA["music_info"]['title']
            var extension = ".mp3"
        }
        downloadFileFromBlob(blobKey, filename, extension)
        toggleButtonLoading(button)
    }
}
const toggleButtonLoading = (button) => {
    console.log("toggled button state")
    const loader = button.querySelector("#loader")
    const text = button.querySelector(".button-content")
    const loading = !(loader.classList.contains('hidden'))

    loader.classList.toggle('hidden')
    text.classList.toggle('opacity-0')

    if (loading) {
        button.style.pointerEvents = "all"
    } else {
        button.style.pointerEvents = "none"
    }
}
const KMBFormat = (num) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num)
}


startLoading()
makeRequest()


