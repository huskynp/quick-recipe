var ingredients = [];


(async () =>{ 

// mongo realm
const app = new Realm.App({ id: "quick-recipe-wgklz" });


// log in with async credentials
const credentials = Realm.Credentials.anonymous();
const user = await app.logIn(credentials);

// get collection
const mongo = user.mongoClient('mongodb-atlas');
const recipes = mongo.db('recipes').collection('recipes');

const google_query_vars = (r_name) =>{ 
    return{
        cx: '538008222c9ca3a37',
        key: "AIzaSyBMpTGdGshLYxgqalfh0oxqb27aLvY8Kdc",
        q: r_name,
        num: 1,
        searchType: 'image',
        imgSize: "MEDIUM"
    }
}

const getGoogleResults = async (recipe) => {
    const query_vars = google_query_vars(recipe.name);
    return $.get(`https://www.googleapis.com/customsearch/v1?`, query_vars)
    .then(response => {
        if(response.searchInformation.totalResults !== '0'){
            return [response.items[0].link, response.items[0].title];
        }else{
            return 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'
        }
    });
}

const showRecipe = async (recipe) => {
    
    const recipe_name = decodeURI(new DOMParser().parseFromString(recipe.name, 'text/html').documentElement.textContent);
    const description = (recipe.description === '.' ? 'No description.' : recipe.description);
    
    const [imageResults, imageTitle] = await getGoogleResults(recipe);
    
    $(".recipe>div>h2").text(recipe_name);
    $(".recipe>div>i").text(description);
    $(".recipe>div>a").attr('href', "https://www.food.com/recipe/"+recipe['_id'].toString());
    $(".recipe>img").attr('src', imageResults);
    $(".recipe>img").attr('title', imageTitle);

    $(".loading").hide();
    $(".recipe").show();
}

const search = async (ingredients) => {
    $(".loading").show();
    const recipe = await recipes.aggregate([ // randomly gets 1 recipe w ingredients
        { "$match": {"ingredients": { "$all": ingredients }} },
        { "$sample": { "size": 1 } }
    ]);
    return recipe[0];
}

$('#submit').click(async () =>{
    $(".recipe").hide();
    if(ingredients.length === 0){ return; }

    const recipe = await search(ingredients);

    if(recipe){
        showRecipe(recipe);
    } else {
        alert("tough one! we couldn't find any recipe.")
    }

});

})();

const changeSubmitButton = () => {
    if(ingredients.length > 0){
        $('#submit').prop('disabled', false);
        $("#submit").text("find a masterpiece...");
    } else {
        $('#submit').prop('disabled', true);
        $("#submit").text("add ingredients...");
    }
}

const addIngredient = (ingredient) => {
    if(ingredients.includes(ingredient)) return;
    ingredients.push(ingredient);

    const index = ingredients.length - 1;

    // add ingredient to text
    $('#ingredients').append(`
        <div class="ingredient" id="ingredient-${index}">
            <span>${ingredient}</span>
            <button class="remove-ingredient" onclick="removeIngredient(${index})">x</button>
        </div>
    `);

    changeSubmitButton();
}

const removeIngredient = (index) => {
    ingredients.splice(index, 1);

    $(`#ingredient-${index}`).remove();

    changeSubmitButton();
}


const foodEmojis = [ '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍍', '🥝', '🍅', '🥑', '🥔', '🥕', '🌽', '🥒', '🥬', '🍠', '🍢', '🍣', '🍤', '🍡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '🍱', '🍲', '🍳', '🍵', '🍶', '🍷', '🍸', '🍹', '🍺', '🍻', '🍾', '🍿', ]

$(".recipe").hide();
$(".loading").hide();

// add random emoji to h2 id title's text
$('#title').text("instant recipe generator  " + foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
