/**
 * Created by rober on 6/21/2017.
 */
let _ = require('lodash');

let globalOrders = Game.market.getAllOrders();
let myOrders = Game.market.orders;

let reactionNeeds = [
    RESOURCE_HYDROGEN,
    RESOURCE_GHODIUM,
    RESOURCE_UTRIUM,
    RESOURCE_OXYGEN
];

let tradeTargets = [RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_POWER];

module.exports.terminalControl = function () {
    for (let terminal of _.values(Game.structures)) {
        if (terminal.structureType === STRUCTURE_TERMINAL) {
            //if we have credits make sure we have energy
            buyEnergy(terminal);

            //extend old orders first
            extendSellOrders(terminal);

            //Try to put up a sell, otherwise fill buy
            placeSellOrders(terminal);
            fillBuyOrders(terminal);

            //Extend/Place buy orders
            extendBuyOrders(terminal);
            placeBuyOrders(terminal);
            buyReactionNeeds(terminal);
        }
    }
};

function fillBuyOrders(terminal) {
    if (terminal.store[RESOURCE_ENERGY] >= 1000) {
        for (const resourceType in terminal.store) {
            if (terminal.store[resourceType] >= 2500 && resourceType !== RESOURCE_ENERGY) {
                let buyOrder = _.max(globalOrders.filter(order => order.resourceType === resourceType &&
                order.type === ORDER_BUY && order.remainingAmount >= 1000 && order.roomName !== terminal.pos.roomName &&
                Game.market.calcTransactionCost(1000, terminal.pos.roomName, order.roomName) <= 500), 'price');
                if (buyOrder.id) {
                    if (Game.market.deal(buyOrder.id, 1000, terminal.pos.roomName) === OK) {
                        console.log("<font color='#adff2f'>MARKET: buyOrderFilled - 1000 " + resourceType + " for " + buyOrder.price * 1000 + "</font>");
                    }
                } else {
                    let buyOrder = _.max(globalOrders.filter(order => order.resourceType === resourceType &&
                    order.type === ORDER_BUY && order.remainingAmount >= 1000 && order.roomName !== terminal.pos.roomName &&
                    Game.market.calcTransactionCost(1000, terminal.pos.roomName, order.roomName) <= 1000), 'price');
                    if (buyOrder.id) {
                        if (Game.market.deal(buyOrder.id, 1000, terminal.pos.roomName) === OK) {
                            console.log("<font color='#adff2f'>MARKET: buyOrderFilled - 1000 " + resourceType + " for " + buyOrder.price * 1000 + "</font>");
                        }
                    }
                }
            }
        }
    }
}

function buyEnergy(terminal) {
    if (terminal.store[RESOURCE_ENERGY] < 10000 || !terminal.store[RESOURCE_ENERGY]) {
        for (let key in myOrders) {
            if (myOrders[key].resourceType === RESOURCE_ENERGY && myOrders[key].type === ORDER_BUY) {
                let currentSupply;
                if (isNaN(terminal.store[RESOURCE_ENERGY]) === true) {
                    currentSupply = 0;
                } else {
                    currentSupply = terminal.store[tradeTargets[i]];
                }
                let buyOrder = _.max(globalOrders.filter(order => order.resourceType === RESOURCE_ENERGY &&
                order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), "price");
                if (buyOrder.id && (_.round(buyOrder.price, 2)) !== _.round(myOrders[key].price, 2) && buyOrder.price < 0.05) {
                    if (Game.market.changeOrderPrice(myOrders[key].id, buyOrder.price) === OK) {
                        console.log("<font color='#adff2f'>MARKET: Energy buy order price change " + myOrders[key].id + " new/old " + buyOrder.price + "/" + myOrders[key].price + "</font>");
                    }
                    return;
                }
                if (myOrders[key].remainingAmount < (20000 - currentSupply)) {
                    if (Game.market.extendOrder(myOrders[key].id, 20000 - (currentSupply + myOrders[key].remainingAmount)) === OK) {
                        console.log("<font color='#adff2f'>MARKET: Extended energy buy order " + myOrders[key].id + " an additional " + myOrders[key].remainingAmount - (20000 - currentSupply) + "</font>");
                    }
                }
                return;
            }
        }
        let buyOrder = _.max(globalOrders.filter(order => order.resourceType === RESOURCE_ENERGY &&
        order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), "price");
        if (buyOrder.id) {
            if (Game.market.createOrder(ORDER_BUY, RESOURCE_ENERGY, buyOrder.price, 20000, terminal.pos.roomName) === OK) {
                console.log("<font color='#adff2f'>MARKET: New Buy Order: " + RESOURCE_ENERGY + " at/per " + (buyOrder.price) + "</font>");
            }
        }
    }
}

function extendSellOrders(terminal) {
    resource:
        for (const resourceType in terminal.store) {
            for (let key in myOrders) {
                if (resourceType !== RESOURCE_ENERGY && myOrders[key].resourceType === resourceType && myOrders[key].type === ORDER_SELL) {
                    let sellOrder = _.min(globalOrders.filter(order => order.resourceType === resourceType &&
                    order.type === ORDER_SELL && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), "price");
                    let buyOrder = _.max(globalOrders.filter(order => order.resourceType === resourceType &&
                    order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                    if (sellOrder.id && _.round(sellOrder.price - 0.01, 2) !== _.round(myOrders[key].price, 2) && _.round(sellOrder.price - 0.01, 2) > _.round(buyOrder.price, 2)) {
                        if (Game.market.changeOrderPrice(myOrders[key].id, (sellOrder.price - 0.01)) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Sell order price change " + myOrders[key].id + " new/old " + (sellOrder.price - 0.01) + "/" + myOrders[key].price + " Resource - " + resourceType + "</font>");
                        }
                        continue resource;
                    }
                    if (sellOrder.id && _.round(sellOrder.price - 0.01, 2) !== _.round(myOrders[key].price, 2) && _.round(sellOrder.price - 0.01, 2) < _.round(buyOrder.price, 2)) {
                        if (Game.market.changeOrderPrice(myOrders[key].id, (sellOrder.price - 0.01)) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Sell order price change " + myOrders[key].id + " new/old " + (sellOrder.price - 0.01) + "/" + myOrders[key].price + " Resource - " + resourceType + "</font>");
                        }
                        continue resource;
                    }
                    if (terminal.store[resourceType] > myOrders[key].remainingAmount && _.includes(reactionNeeds, resourceType) === false) {
                        if (Game.market.extendOrder(myOrders[key].id, terminal.store[resourceType]) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Extended sell order " + myOrders[key].id + " an additional " + terminal.store[resourceType] + " " + resourceType + "</font>");
                        }
                    }
                    if (terminal.store[resourceType] - 1000 > myOrders[key].remainingAmount && _.includes(reactionNeeds, resourceType) === true) {
                        if (Game.market.extendOrder(myOrders[key].id, terminal.store[resourceType]) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Extended sell order " + myOrders[key].id + " an additional " + terminal.store[resourceType] - 1000 + " " + resourceType + "</font>");
                        }
                    }
                }
            }
        }
}

function placeSellOrders(terminal) {
    resource:
        for (const resourceType in terminal.store) {
            if (resourceType !== RESOURCE_ENERGY) {
                for (let key in myOrders) {
                    if (myOrders[key].resourceType === resourceType && myOrders[key].type === ORDER_SELL && myOrders[key].roomName === terminal.pos.roomName) {
                        continue resource;
                    }
                }
                let sellOrder = _.min(globalOrders.filter(order => order.resourceType === resourceType &&
                order.type === ORDER_SELL && order.remainingAmount >= 7500 && order.roomName !== terminal.pos.roomName), 'price');
                if (sellOrder.id && _.includes(reactionNeeds, resourceType) === false) {
                    if (Game.market.createOrder(ORDER_SELL, resourceType, (sellOrder.price - 0.01), terminal.store[resourceType], terminal.pos.roomName) === OK) {
                        console.log("<font color='#adff2f'>MARKET: New Sell Order: " + resourceType + " at/per " + (sellOrder.price - 0.01) + "</font>");
                    }
                }
                if (sellOrder.id && _.includes(reactionNeeds, resourceType) === true && terminal.store[resourceType] - 1000 > 0) {
                    if (Game.market.createOrder(ORDER_SELL, resourceType, (sellOrder.price - 0.01), terminal.store[resourceType] - 1000, terminal.pos.roomName) === OK) {
                        console.log("<font color='#adff2f'>MARKET: New Sell Order: " + resourceType + " at/per " + (sellOrder.price - 0.01) + "</font>");
                    }
                }
            }
        }
}

function extendBuyOrders(terminal) {
    resource:
        for (let i = 0; i < tradeTargets.length; i++) {
            for (let key in myOrders) {
                if (tradeTargets[i] !== RESOURCE_ENERGY && myOrders[key].resourceType === tradeTargets[i] && myOrders[key].type === ORDER_BUY) {
                    let currentSupply;
                    if (isNaN(terminal.store[tradeTargets[i]]) === true) {
                        currentSupply = 0;
                    } else {
                        currentSupply = terminal.store[tradeTargets[i]];
                    }
                    let buyOrder = _.max(globalOrders.filter(order => order.resourceType === tradeTargets[i] &&
                    order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                    let sellOrder = _.min(globalOrders.filter(order => order.resourceType === tradeTargets[i] &&
                    order.type === ORDER_SELL && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                    if (buyOrder.id && (_.round(buyOrder.price, 2)) !== _.round(myOrders[key].price, 2) && ((sellOrder.price - 0.01) - buyOrder.price) > 0.02) {
                        if (Game.market.changeOrderPrice(myOrders[key].id, (buyOrder.price)) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Buy order price change " + myOrders[key].id + " new/old " + buyOrder.price + "/" + myOrders[key].price + " Resource - " + tradeTargets[i] + "</font>");
                        }
                        continue resource;
                    }
                    if (currentSupply + myOrders[key].remainingAmount < 2000 && _.round(((sellOrder.price - 0.01) - buyOrder.price), 2) > 0.02) {
                        if (Game.market.extendOrder(myOrders[key].id, 2000 - (currentSupply + myOrders[key].remainingAmount)) === OK) {
                            console.log("<font color='#adff2f'>MARKET: Extended Buy order " + myOrders[key].id + " an additional " + (2000 - (currentSupply + myOrders[key].remainingAmount)) + " " + tradeTargets[i] + "</font>");
                        }
                    }
                }
            }
        }
}

function placeBuyOrders(terminal) {
    resource:
        for (let i = 0; i < tradeTargets.length; i++) {
            if (terminal.store[tradeTargets[i]] < 2000 || !terminal.store[tradeTargets[i]]) {
                for (let key in myOrders) {
                    if (myOrders[key].resourceType === tradeTargets[i] && myOrders[key].type === ORDER_BUY) {
                        continue resource;
                    }
                }
                let buyOrder = _.max(globalOrders.filter(order => order.resourceType === tradeTargets[i] &&
                order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                let sellOrder = _.min(globalOrders.filter(order => order.resourceType === tradeTargets[i] &&
                order.type === ORDER_SELL && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                if (buyOrder.id && ((sellOrder.price - 0.01) - buyOrder.price) > 0.02) {
                    if (Game.market.createOrder(ORDER_BUY, tradeTargets[i], buyOrder.price, 2000, terminal.pos.roomName) === OK) {
                        console.log("<font color='#adff2f'>MARKET: New Buy Order: " + tradeTargets[i] + " at/per " + (buyOrder.price) + "</font>");
                    }
                }
            }
        }
}

function buyReactionNeeds(terminal) {
    resource:
        for (let i = 0; i < reactionNeeds.length; i++) {
            if (terminal.store[reactionNeeds[i]] < 2000 || !terminal.store[reactionNeeds[i]]) {
                for (let key in myOrders) {
                    if (myOrders[key].resourceType === reactionNeeds[i] && myOrders[key].type === ORDER_BUY) {
                        continue resource;
                    }
                }
                let buyOrder = _.max(globalOrders.filter(order => order.resourceType === reactionNeeds[i] &&
                order.type === ORDER_BUY && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                let sellOrder = _.min(globalOrders.filter(order => order.resourceType === reactionNeeds[i] &&
                order.type === ORDER_SELL && order.remainingAmount >= 10000 && order.roomName !== terminal.pos.roomName), 'price');
                if (buyOrder.id && ((sellOrder.price - 0.01) - buyOrder.price) > 0.01) {
                    if (Game.market.createOrder(ORDER_BUY, reactionNeeds[i], buyOrder.price, 2000, terminal.pos.roomName) === OK) {
                        console.log("<font color='#adff2f'>MARKET: Reaction Needs Buy Order: " + reactionNeeds[i] + " at/per " + (buyOrder.price) + "</font>");
                    }
                }
            }
        }
}