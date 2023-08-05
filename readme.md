# Como configurar o github actions
1. Ir em Perfil do usuário > Developer settings > Personal access tokens > Fine-grained tokens
2. Criar um token com o nome CUSTOM_GITHUB_TOKEN a permissão: All repositories > Contents > Read & write
3. Ir em Settings > Secrets and variables > Actions > Secrets
4. Adicionar variável chamada CUSTOM_GITHUB_TOKEN com o token do github

# Como instalar localmente
1. Instalar o [Node.js](https://nodejs.org/en/download/)
2. npm i -g yarn
3. yarn install
4. git submodule init
5. git submodule update --remote