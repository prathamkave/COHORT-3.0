// Question 1 (Easy) — Find Expensive Products

let prices= [100,250,500,150,700];

function showPremiumProducts(prices){
    return prices.filter(price => price > 300);
}

console.log(showPremiumProducts(prices));

// ----------------------------------------------------------
// Question 2 (Moderate) — Student Average

let marks= [80,90,70,85,95];

function calculateAverage(marks){
    let total = marks.reduce((sum, mark) => sum + mark, 0);
    return total / marks.length;
}

console.log(calculateAverage(marks));

// ----------------------------------------------------------
// Question 3 (Hard) — Most Frequent Number

let numbers= [1,2,3,2,4,1,2];

function findMostFrequentNumber(numbers){
    let frequency = {};
    let maxFreq = 0;
    let mostFrequent;

    for (let num of numbers) {
        frequency[num] = (frequency[num] || 0) + 1;
        if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
            mostFrequent = num;
        }
    }
    return mostFrequent;
}

console.log(findMostFrequentNumber(numbers));

// ----------------------------------------------------------
// Question 4 (Easy) — Update User Age

let user= {
name:"Ritik",
age:20
};

user.age = 21;
console.log(user);

// ----------------------------------------------------------
// Question 5 (Moderate) — Print User Information

let users = {
name:"Ritik",
age:20,
city:"Bhopal"
};

function printUserInfo(user){
    for (let key in user) {
        console.log(`${key}: ${user[key]}`);
    }
}

printUserInfo(users);

// ----------------------------------------------------------
// Question 6 (Hard) — Highest Paid Employee

let employees= {
    Aman : 25000,
    Ritik : 50000,
    Priya : 45000
};

function findHighestPaidEmployee(employees){
    let maxSalary = 0;
    let highestPaidEmployee = "";

    for (let employee in employees) {
        if (employees[employee] > maxSalary) {
            maxSalary = employees[employee];
            highestPaidEmployee = employee;
        }
    }

    return highestPaidEmployee;
}

console.log(findHighestPaidEmployee(employees));

// ----------------------------------------------------------
// Question 7 (Easy) — Greeting Function

function greet(name){
    return `Hello, ${name}`;
}
console.log(greet("Ritik"));

// ----------------------------------------------------------
// Question 8 (Moderate) — Discount Calculator

function calculateDiscount(price) {
    let discount = price * 0.1;
    return price - discount;
}

console.log(calculateDiscount(500));

// ----------------------------------------------------------
// Question 9 (Hard) — Dynamic Sum Function

function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4, 5));

// ----------------------------------------------------------
// Question 10 (Easy) — Find Adult Users

let users= [
    { name:"Ritik", age:20 },
    { name:"Aman", age:16 },
    { name:"Priya", age:25 }
];

function findAdultUsers(users){
    return users.filter(user => user.age >= 18);
}

console.log(findAdultUsers(users));

// ----------------------------------------------------------
// Question 11