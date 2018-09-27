# Rover [![Build Status](https://travis-ci.org/Fueled/Rover.svg?branch=develop)](https://travis-ci.org/Fueled/Rover)

> Testing/Interaction for your Smart Contract made simple.

Interact with Smart Contract ABI, Monitoring Realtime Events and Transactions.

## "Swagger for smart contracts"

Rover gives ability to load up smart contracts and execute methods and read out the contract state. Besides that it can listen to events occurred that are emitted by the smart contract code.

### Features :

* App loads up ABI json with deployed Contract address
* Shows list of **methods**
  * Shows what input arguments are needed
  * Indicates if payable or view value
  	* Payable runs through the `web3` current provider
  	* Non payable is executed immediately
* Shows list of **variables**
    * Able to execute methods and variables
    * Input variables are interpreted
    * `bytes32` will give a converter from text to `bytes32`
    * Adress will give all connected accounts to `Web3` provider
    * Shows return value of non payable methods
    * Transforms `bytes32` to string
* Transactions to smart contract can be seen in list
    * Shows transaction input and output
    * Shows all events happened in method execution
    * Shows gas costs and value passed
* Google login to remember ABIs and previous used addresses for quick retrieval.


## Contributing

If something is unclear, confusing, or needs to be refactored, please let me know. Pull requests are always welcome, but due to the opinionated nature of this project, I cannot accept every pull request. Please open an issue before submitting a pull request. This project uses [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with a few minor exceptions. If you are submitting a pull request that involves Pug templates, please make sure you are using *spaces*, not tabs.

--------

## Powered by Etherscan.io APIs :heart:

--------

Built with :heart: at [Fueled](https://fueled.com)

## License

```
The MIT License (MIT)

Copyright (c) 2018 Fueled

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
