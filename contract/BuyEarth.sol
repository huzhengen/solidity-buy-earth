// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract BuyEarth {
    uint256 private constant PRICE = 0.01 ether;
    address private owner;
    uint[100] private squares;

    constructor() {
        owner = msg.sender;
    }

    function getSquares() public view returns (uint[] memory) {
        uint[] memory _squares = new uint[](100);
        for (uint i; i < 100; i++) {
            _squares[i] = squares[i];
        }
        return _squares;
    }

    function buySquare(uint idx, uint color) public payable {
        require(idx >= 0 && idx < 100, "Invalid index");
        require(msg.value >= PRICE, "Insufficient payment");
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to sent Ehter");
        squares[idx] = color;
    }
}
