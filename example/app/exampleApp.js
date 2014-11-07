angular.module('example', [])

  .controller('ExampleController', function ExampleController() {


    var vm = this;

    vm.selectItem = selectItem;
    vm.selectedListItem = '';
    vm.items = [
      'one', 'two', 'three'
    ];

    function selectItem(listItem) {
      vm.selectedListItem = listItem;
    }

  });
