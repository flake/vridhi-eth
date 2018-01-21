pragma solidity ^0.4.17;
contract ScoreStore{
    mapping(string => int) PersonScores;

    function AddPersonScore(string name, int startingScore) public {
      require(PersonScores[name]==0);
      PersonScores[name]=startingScore;
    }

    function GetScore(string name) public view returns (int){
      return PersonScores[name];
    }
}
