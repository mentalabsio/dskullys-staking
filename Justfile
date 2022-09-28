alias b := build
alias t := test

default:
	@just --list

build:
	anchor build 
	anchor run gen

test:
	anchor t --provider.cluster localnet

clean:
	anchor clean
	rm -rf node_modules
