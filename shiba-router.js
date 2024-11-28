let loadedRouters = [];

if(typeof rootPath === 'undefined'){
    rootPath = "/";
}

window.addEventListener('DOMContentLoaded', loadRoutes);
window.addEventListener('popstate', ()=>{
    //window.location.reload()
    modifyPath(window.location.pathname.replace(rootPath, ""))
});

function loadRoutes() {
    let toLoad = [];

    if (window.location.pathname.endsWith("/")) {
        let newPath = rmLastSlash(window.location.pathname).replaceAll("//", "/");
        window.history.replaceState({ path: newPath }, '', newPath);
    }

    const currentPath = window.location.pathname;
    let routers = document.querySelectorAll("shiba-browserRouter");

    routers.forEach(browserRouter => {
        let routes = browserRouter.querySelectorAll("shiba-route");
        const parentEl = browserRouter.parentElement;

        if (!browserRouter.dataset.routerId) {
            browserRouter.dataset.routerId = generateRandomString(16);
        }

        const routerId = browserRouter.dataset.routerId;

        if (!loadedRouters.some(subArray => subArray.includes(routerId))) {
            if (document.querySelector(`shiba-routerPlaceholder[data-routerId='${routerId}']`) === null) {
                const placeholder = document.createElement('shiba-routerPlaceholder');
                placeholder.setAttribute('data-routerId', routerId);
                parentEl.appendChild(placeholder);
            }
            let shouldSkip=false;
            routes.forEach(route => {
                if(!shouldSkip){
                    if (!loadedRouters.some(subArray => subArray.includes(routerId))) {
                        loadedRouters.push([routerId, route.dataset.path]);
                    }

                    if (rmLastSlash(addLastSlash(rootPath) + rmLastSlash(route.dataset.path)).replaceAll("//", "/") === rmLastSlash(currentPath) ||
                        (route.dataset.path.includes("*") &&
                            rmLastSlash(currentPath).startsWith(rmLastSlash(addLastSlash(rootPath) + rmLastSlash(route.dataset.path.replace("*", ""))).replaceAll("//", "/")))) {
                        toLoad.push({
                            selector: `shiba-routerPlaceholder[data-routerId='${routerId}']`,
                            src: addLastSlash(rootPath) + route.dataset.src
                        });
                        shouldSkip=true;
                    }
                }
            });
        }
    });
    if (toLoad != []) {
        for(let obj of toLoad){
            $(obj.selector).load(obj.src, loadRoutes)
        }
        toLoad=[];
    }
}


const rmLastSlash = (str) => {
    return str.endsWith("/") ? str.slice(0, -1) : str;
};

const addLastSlash = (str) => {
    return str.endsWith("/") ? str : str + "/";
};

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function modifyPath(newPath) {

    let queryParams = new URLSearchParams(window.location.search); // Parse current query parameters
    newPath = (addLastSlash(rootPath) + newPath).replaceAll("//", "/");
    const originalNewPath=newPath

    const existingParams = new URLSearchParams(newPath.split('?')[1] || '');
    for (const [key, value] of queryParams.entries()) {
        if (!existingParams.has(key)) {
            existingParams.append(key, value);
        }
    }

    if(originalNewPath.split("?").length>1 || 1){
        newPath = newPath.split('?')[0] + '?' + existingParams.toString();
    }
    
    window.history.pushState({ path: newPath }, '', newPath);

    loadedRouters = loadedRouters.filter(el => !window.location.pathname.startsWith(el[1].replace("/*", "")));

    loadRoutes();
}