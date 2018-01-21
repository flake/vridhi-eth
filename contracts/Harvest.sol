pragma solidity ^0.4.17;
/*pragma experimental ABIEncoderV2;*/

contract Harvest {
  struct Farmer {
    bytes32 name;
    bytes32 village;
    bool certified;
  }
  mapping(address => Farmer) farmers;

  struct Crop {
    bytes32 name;
    /*bytes32 harvestDate;*/
    /*bytes32 village;*/
  }

  /*struct Academic {
    uint id;
    uint universityId;
    bytes32 name;
    bytes32 education;
    uint energyConsumed;
    uint waterConsumed;
  }

  struct University {
    uint id;
    bytes32 name;
    bytes32 district;
    bytes32 state;
    uint energyConsumed;
    uint waterConsumed;
    uint rank;
  }

  struct Distributor {
    uint id;
    bytes32 name;
    bytes32 district;
    bytes32 state;
    uint energyConsumed;
    uint waterConsumed;
    uint rank;
  }*/

  struct Market {
    uint id;
    bytes32 country;
  }

  struct Stock {
    string crop;
    uint quantity;
  }

  address[] paths;
  mapping(address => Stock) stockData;

  struct Netizen {
    bytes32 id;
    bytes32 netizenType;
    bytes32 village;
  }

  mapping (address => Netizen) netizens;

  function addNetizen(bytes32 id, bytes32 netizenType, bytes32 village) returns (bool success){
    if (netizens[msg.sender].id == id) return false;

    netizens[msg.sender].id = id;
    netizens[msg.sender].netizenType = netizenType;
    netizens[msg.sender].village = village;

    return true;
  }

  function addFarmer(bytes32 name, bytes32 village) returns (bool success) {
    if (farmers[msg.sender].name == name) return false;

    farmers[msg.sender].name = name;
    farmers[msg.sender].village = village;
    farmers[msg.sender].certified = false;

    return true;
  }

  function sendCrop(string crop, address to) payable returns (bool success) {
    stockData[to].crop = crop;
    stockData[to].quantity = msg.value;
    if (paths.length == 0) {
      paths.push(msg.sender);
      paths.push(to);
    } else if (paths[paths.length-1] == msg.sender) {
      paths.push(to);
    }
    return true;
  }

  function getPath() constant returns (address[] ) {
    return paths;
  }
}
