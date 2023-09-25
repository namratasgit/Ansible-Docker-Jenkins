# Ansible-Docker-Jenkins

1.	Create two ec2 instances –jenkins and docker[keypair –jenkinskp]
2.	Connect using ssh to both and change hostnames-
JENKINS : 

sudo hostnamectl set-hostname Jenkins
ubuntu@ip-172-31-27-107:~$ /bin/bash

3.	JENKINS :  Install Jenkins and java in Jenkins instance.

i.	sudo apt-get install openjdk-11-jre
open ~/.bashrc and set JAVA_HOME = /usr/lib/jvm/java-11-openjdk-amd64/bin/java

ii.	Download and install Jenkins as a 

service[https://www.jenkins.io/doc/book/installing/linux/#debianubuntu]
Jenkins.io/ --- documentation --- installing Jenkins ---- linux ---
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install Jenkins


to find Jenkins.war --.
ubuntu@Jenkins:~$ sudo find / -name jenkins.war
/usr/share/java/jenkins.war

systemctl status jenkins
4.	DOCKER : install docker engine in the docker instance [https://docs.docker.com/engine/install/ubuntu/]

 # Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

#Install latest version
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

//to add current user ‘ubuntu’ to docker group ‘docker
 [a. sudo usermod -aG docker Ubuntu 
b. newgrp docker --> to refresh the group
then run docker ps]

5.	JENKINS : Install ansible in Jenkins
[https://docs.ansible.com/ansible/latest/installation_guide/installation_distros.html#installing-ansible-on-ubuntu ]

$ sudo apt update
$ sudo apt install software-properties-common
$ sudo add-apt-repository --yes --update ppa:ansible/ansible
$ sudo apt install ansible

6.	DOCKER : In Docker, we now switch to root user using --> 
7.	
		sudo su
		ssh-keygen and press only enter until key gets generated

Your public key has been saved in /root/.ssh/id_rsa.pub

a.	Now move back to root user --> cd ~/
b.	root@Docker:# ls
c.	ls –la
d.	cd .ssh/ --> to get inside .ssh folder where pub-key is stored
e.	ls  authorized-keys  id_rsa   id_rsa.pub

8.	JENKINS : 
a.	To run docker commands from Jenkins instance, we need to install some dependencies-

i.	sudo apt install python3-pip
ii.	pip install docker

b.	Now get inside the host file and add the docker host/hosts 

$ cd /etc/ansible
$ sudo nano hosts
And add 
[dockerservers]
  54.91.3.42

c.	Now we switch to root user and then to Jenkins user
	ubuntu@Jenkins:~$ sudo su  to switch to root user
	root@Jenkins:/home/ubuntu# su jenkins  to switch to Jenkins user
	jenkins@Jenkins:/home/ubuntu$ cd
	jenkins@Jenkins:ls  to get to Jenkins directory


[ubuntu@Jenkins:~$ cd /var/lib/Jenkins
sudo passwd Jenkins
sudo service jenkins restart

Now username is Jenkins and password is namratasjenkins123


d.	We now create an ssh key for the Jenkins user
ssh-keygen
  ls –la
cd .ssh/ 
ls  id_rsa   id_rsa.pub
cat id_rsa.pub  copy-paste the key generated to the docker authorized keys
and check if we can connect to docker root
jenkins@Jenkins:~/.ssh$ ssh root@54.91.3.42

9.	DOCKER :
root@Docker:~/.ssh# systemctl reload sshd
root@Docker:~/.ssh# cd ~
root@Docker:~# ls
snap
root@Docker:~# mkdir project


10.	JENKINS : 
a.	Now we go back to Jenkins user and create a playbook directory under it.
mkdir playbooks

b.	Move to the playbook – cd playbooks and create deployment.yaml

	Nano deployment.yaml

- name: Build and Deploy Docker Container
  hosts: dockerservers
  gather_facts: false
  remote_user: root
  tasks:
    - name: Copy the files to remote server
      shell: scp -r /var/lib/jenkins/workspace/ansible-jenkins-pipeline root@54.91.3.42:~/project

    - name: Building Docker Image
      docker_image:
        name: mico:latest
        source: build
        build:
          path: ~/project
        state: present


    - name: Creating the container
      docker_container:
        name: mico-container
        image: mico:latest
        ports:
          - "80:80"
        state: started

c.	Run the playbook -
ansible-playbook deployment.yaml

d.	Enable webhook in Jenkins(enable both github hook trigger for github scm… and poll scm) and in github -- repo settings -- webhooks -- http://18.234.132.31:8080/github-webhook/, send me everything, update


11.	DOCKER :

a.	If while playing ansible playbook, error occurs, do the following-
root@Docker:~/project# cd ansible-jenkins-pipeline
root@Docker:~/project/ansible-jenkins-pipeline# ls
Dockerfile  README.md  calculator.html  hooktest  script.js  style.css
root@Docker:~/project/ansible-jenkins-pipeline# mv ./* ../ [move the dockerfile out of ansible-jenkins pipeline]
root@Docker:~/project/ansible-jenkins-pipeline# cd
root@Docker:~# cd project
root@Docker:~/project# ls
Dockerfile  ansible-jenkins-pipeline  hooktest   style.css
README.md   calculator.html           script.js

b.	root@Docker:~/project# docker ps [to check the docker container, after playbook runs succesfully]

12.	JENKINS : Again edit and run a different container

- name: Build and Deploy Docker Container
  hosts: dockerservers
  gather_facts: false
  remote_user: root
  tasks:
#    - name: Copy the files to remote server
#      shell: scp -r /var/lib/jenkins/workspace/ansible-jenkins-pipeline/* root@54.91.3.42:~/project

    - name: Stopping the container
      docker_container:
        name: mico-container
        image: mico:latest
        state: stopped

    - name: Removing Docker Container
      docker_container:
        name: mico-container
        image: mico:latest
        state: absent

    - name: Removing Docker Image
      docker_image:
        name: mico:latest
        state: absent

    - name: Building Docker Image
      docker_image:
        name: mico:latest
        source: build
        build:
          path: ~/project
        state: present



    - name: Creating the container
      docker_container:
        name: mico-container
        image: mico:latest
        ports:
          - "80:80"
        state: started


and copy paste 
scp -r /var/lib/jenkins/workspace/ansible-jenkins-pipeline/ root@54.91.3.42:~/project/ 
in Build step  execute shell and build

now add,
ansible-playbook /var/lib/jenkins/playbooks/deployment.yaml
and build again

now edit deployment.yaml

13.	Copy-paste 54.91.3.42 in browser to check if application in running succesfully
