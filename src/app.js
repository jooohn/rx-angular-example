var app = angular.module('plunker', []);
app.controller('MainCtrl', function($scope, $http, $timeout, $filter) {
  $scope.continents = [
    'Asia',
    'Europe',
    'Africa',
    'North America',
    'Sourth America'
    ];
  $scope.keyword = '';
  $scope.continent = 'Asia';
  
  $scope.$watch('keyword', startSearching);
  $scope.$watch('continent', startSearching);
  $scope.loadMore = () => {
    $scope.page += 1;
    const condition = { keyword: $scope.keyword, continent: $scope.continent };
    search(condition, $scope.page).then(countries => {
      $scope.countries = [...$scope.countries, countries];
    });
  };
  $scope.page = 1;

  function startSearching() {
    const condition = { keyword: $scope.keyword, continent: $scope.continent };
    $scope.page = 1;
    search(condition, $scope.page).then((countries) => {
      $scope.countries = countries;
    })
  }

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
