// import {getAlgoliaResults} from './algolia';

const client = algoliasearch('8YYBDFZUC8', '3b3086167c358e709cf4dedb285b3f41');

autocomplete({
    container: '#autocomplete',
    placeholder: 'type ingredients...',
    getSources({query}){
      return[
        {
          sourceId: 'name',
          getItems(){
            return getAlgoliaResults({
              searchClient: client,
              queries: [
                {
                  indexName: 'ingredients',
                  query,
                  params: {
                    hitsPerPage: 5,
                  }
                }
              ]
            });
          },
          onSelect({setQuery, item}){
            setQuery("");
            addIngredient(item.name);
          },
          templates: {
            item({ item, components }) {
              return components.Highlight({ hit: item, attribute: 'name', tagName:'b' });
            },
          },
        },
      ];
    },
  });