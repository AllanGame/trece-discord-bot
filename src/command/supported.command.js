export default {
  executor: SupportedCommand,
  name: 'supported',
}

async function SupportedCommand(interaction) {
  await interaction.reply(
    `
        \`\`\`
        +       Operador de suma ej. 2+3 resulta en 5
        -       Operador de resta ej. 2-3 resulta en -1
        /       Operador de divisón ej 3/2 resulta en 1.5 
        \\       Operador de multiplicación ej. 23 resulta en 6
        Mod     Modulus Operator eg. 3 Mod 2 results 1
        (       Opening Parenthesis
        )       Closing Parenthesis
        Sigma   Summation eg. Sigma(1,100,n) results 5050
        Pi      Product eg. Pi(1,10,n) results 3628800
        n       Variable for Summation or Product
        pi      Math constant pi returns 3.14
        e       Math constant e returns 2.71
        C       Combination operator eg. 4C2 returns 6
        P       Permutation operator eg. 4P2 returns 12
        !       factorial operator eg. 4! returns 24
        log     logarithmic function with base 10 eg. log 1000 returns 3
        ln      natural log function with base e eg. ln 2 returns .3010 
        pow     power function with two operator pow(2,3) returns 8
        ^       power operator eg. 2^3 returns 8
        root    underroot function root 4 returns 2  
        \`\`\`
      `
  )
}
