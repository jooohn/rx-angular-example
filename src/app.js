var app = angular.module('plunker', ['rx']);
app.controller('MainCtrl', function($scope, $http, $timeout, $filter, rx, observeOnScope) {
  $scope.continents = [
    'Asia',
    'Europe',
    'Africa',
    'North America',
    'Sourth America'
    ];
  $scope.keyword = '';
  $scope.continent = 'Asia';
  
  const keyword$ = observeOnScope($scope, 'keyword').map(({ newValue }) => newValue);
  const continent$ = observeOnScope($scope, 'continent').map(({ newValue }) => newValue);
  const loadMore$ = $scope.$createObservableFunction('loadMore');

  // Observable for { keyword, continent }
  // - combineLatest (http://reactivex.io/documentation/operators/combinelatest.html)
  const condition$ = keyword$.combineLatest(continent$).map((list) => {
    return { keyword: list[0], continent: list[1] };
  }).debounce(300);


  // Observable for countries to show.
  // - flatMapLatest (http://reactivex.io/documentation/operators/flatmap.html)
  const countries$ = condition$.flatMapLatest((condition) => {
    // Observable for numbers 1, 2, 3, ... returns 1 immediately when subscribed.
    // - scan (http://reactivex.io/documentation/operators/scan.html)
    const page$ = loadMore$.startWith(0).scan((acc, _) => acc + 1, 0);

    // API response Obserbable for each page.
    // - flatMap (http://reactivex.io/documentation/operators/flatmap.html)
    const apiResponse$ = page$.flatMap(page => rx.Observable.fromPromise(search(condition, page)));

    // combines responses for each page
    const response$ apiResponse$.scan((all, res) => [...all, ...res]);

    return response$;
  }).startWith([]);

  // "subscribe" consumes Observable.
  countries$.subscribe(function(countries) {
    $scope.$applyAsync((scope) => scope.countries = countries);
  });
    
  
  function search(condition, page) {
    console.log('api called');
    const limit = 3;
    const offset = (page - 1) * limit;
    
    // wait 50 ~ 1000 ms for demo.
    const duration = 50 + Math.random() * 950;
    return $timeout(() => fetchCountries(), duration)
      .then((countries) => {
        const filtered = $filter('filter')(countries, condition.keyword)
          .filter((country) => country.continent === condition.continent)
          .slice(offset, offset + limit);
        return filtered;
      });
  }
  
  function fetchCountries() {
    return $http.get('continent_map.json').then((res) => {
      const continentMap = res.data;
      const list = [];
      return Object.keys(continentMap).map((countryName) => {
        const continent = continentMap[countryName];
        return { continent, countryName };
      })
    });
  }
});

