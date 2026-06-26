import promptSync from 'prompt-sync';
const prompt = promptSync();
const n = Number(prompt("Enter the number of rows: "));
// const m = Number(prompt("Enter the number of columns: "));

// 1. The Square Grid

// for (let i = 0; i < n; i++) {
//     for (let j = 0; j < n; j++) {
//         process.stdout.write("* ");
//     }
//     console.log();
// }

// 2. The Right-Angled Triangle

// for (let i = 1; i <= n; i++) {
//     for (let j = 1; j <= i; j++) {
//         process.stdout.write("* ");
//     }
//     console.log();
// }

// 3. The Flight Stairs

// for (let i=1;i<=n;i++) {
//     for (let j=1;j<=i;j++) {
//         process.stdout.write(`${i}`);
//     }
//     console.log();
// }

// 4. The Inverted Pyramid

for (let i=1;i<=(n*2)-1;i++) {
    for (let j=1;j<=(n*2)-1;j++) {
        if(i==j || i+j==n*2) process.stdout.write(`*`);
        
    }
    console.log();
}