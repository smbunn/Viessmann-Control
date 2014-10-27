/* client.h, Header Dateien fuer client.c */
/* $Id: client.h 35 2008-05-05 17:28:07Z marcust $ */

#define CL_TIMEOUT 25 

#ifndef MAXBUF
        #define MAXBUF 4096
#endif

#define ALLOCSIZE 256 


typedef struct txRx *trPtr;

ssize_t recvSync(int fd,char *wait,char **recv);
int connectServer(char *host, int port);
void disconnectServer(int sockfd);
size_t sendServer(int fd,char *s_buf, size_t len);
trPtr sendCmdFile(int sockfd,const char *tmpfile);
trPtr sendCmds(int sockfd,char *commands);


struct txRx {
	char *cmd;
	float result;
	char *err;
	char *raw;
	time_t timestamp;
	trPtr next;
} TxRx;

