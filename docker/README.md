# oauth-demoapp-spring
OpenID Connect demo app using NodeJS.

## Source
Source code can be found at: https://github.com/Identicum/oidc-demoapp-node

## Usage

### Install

Pull `identicum/oidc-demoapp-node` from the Docker repository:

    docker pull identicum/oidc-demoapp-node


Or build `identicum/oidc-demoapp-node` from source:

    git clone https://github.com/Identicum/oidc-demoapp-node.git
    cd oidc-demoapp-node/docker
    docker build -t identicum/oidc-demoapp-node .

### Run

#### Customize your environment
* Get base file from https://github.com/Identicum/oidc-demoapp-node/blob/master/source/.env
* Customize to your environment

#### Run the container
Run the image, binding associated ports, and mounting your custom envronment:

    docker run -p 8080:8080 -v $(pwd)/.env:/usr/src/app/.env:ro identicum/oidc-demoapp-node
