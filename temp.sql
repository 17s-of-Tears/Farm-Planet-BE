
create table board (
  id int unsigned not null AUTO_INCREMENT,
  title varchar(128) not null default '제목을 입력하세요.',
  content text not null default '본문을 입력하세요.',
  hit int unsigned not null default 0,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  primary key (id)
);

create table faq(
  id int unsigned not null AUTO_INCREMENT,
  title varchar(128) not null default '제목을 입력하세요.',
  question text not null default '질문을 입력하세요.',
  ask text not null default '답변을 입력하세요.',
  hit int unsigned not null default 0,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  primary key (id)
);

create table user (
  id int unsigned not null AUTO_INCREMENT,
  name varchar(8) not null,
  accountID varchar(255) not null,
  accountType int unsigned not null default 0,
  password char(60) not null,
  fresh char(36) not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  UNIQUE (accountID, accountType),
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;



create table subscribe(
  id
  date
);


create table farm(
  id int unsigned not null AUTO_INCREMENT,
  name varchar(255) not null,
  yard int unsigned not null default 0,
  address varchar(255) not null,
  locationX float not null default 0,
  locationY float not null default 0,
  imageUrl varchar(2083) null,
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table farmWood (
  id,
  name,
  imageUrl
);

create table farmPlant ()



create table wood (
  id
  name
  image

);

create table plant
  id
  name
  image






create table if not exists user (
  id int unsigned not null AUTO_INCREMENT,
  name varchar(8) not null,
  email varchar(255) not null,
  password char(60) not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  description varchar(20) not null default '',
  UNIQUE (email),
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;




create table admin (
  id int unsigned not null AUTO_INCREMENT,
  name varchar(8) not null,
  accountID varchar(255) not null,
  password char(60) not null,
  fresh char(36) not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  UNIQUE (accountID),
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

insert into admin (name, accountID, password, fresh) values (
  '관리자',
  'admin',
  '$2b$10$UXIi0Al53Sdx/KSuBG4OUu3VwNh2pft2chwaC9nKP6BnV91B4S4PW',
  'b6797c9f-67ea-4e10-8c4e-304da1037f06'
);

create table farmBanner (
  id int unsigned not null AUTO_INCREMENT,
  imageUrl varchar(2083) not null,
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table plantCategory (
  id int unsigned not null AUTO_INCREMENT,
  name varchar(256) not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  primary key (id)
);

create table plant (
  id int unsigned not null AUTO_INCREMENT,
  categoryId int unsigned null,
  name varchar(256) not null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  foreign key (categoryId) references plantCategory(id) on delete set null,
  primary key (id)
);

create table banner (
  id int unsigned not null AUTO_INCREMENT,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  primary key (id)
);

create table subscribe (
  id int unsigned not null AUTO_INCREMENT,
  farmId int unsigned null,
  userId int unsigned null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  expiredAt timestamp null,
  subscribed boolean not null default 0,
  foreign key (farmId) references farm(id),
  foreign key (userId) references user(id),
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

create table subscribePlant (
  id int unsigned not null AUTO_INCREMENT,
  subscribeId int unsigned null,
  plantId int unsigned null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  foreign key (subscribeId) references subscribe(id) on delete cascade,
  foreign key (plantId) references plant(id),
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
alter table subscribePlant add column expired boolean not null default 0;
alter table subscribePlant add column expiredAt timestamp null;

create table subscribePlantState (
  id int unsigned not null AUTO_INCREMENT,
  subscribePlantId int unsigned null,
  createdAt timestamp not null default current_timestamp,
  modifiedAt timestamp not null default current_timestamp on update current_timestamp,
  imageUrl varchar(2083) null,
  foreign key (subscribePlantId) references subscribePlant(id) on delete cascade,
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
