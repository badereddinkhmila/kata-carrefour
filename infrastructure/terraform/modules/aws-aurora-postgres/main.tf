resource "aws_security_group" "db" {
  name        = "${var.name}-aurora-sg"
  description = "Allow PostgreSQL access"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.allowed_security_group_ids
    content {
      description     = "PostgreSQL from app SG"
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name}-aurora-sg" })
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-aurora-subnets"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, { Name = "${var.name}-aurora-subnets" })
}

resource "aws_rds_cluster" "this" {
  cluster_identifier      = "${var.name}-aurora"
  engine                  = "aurora-postgresql"
  engine_version          = var.engine_version
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.db.id]
  backup_retention_period = var.backup_retention_period
  storage_encrypted       = true
  skip_final_snapshot     = var.skip_final_snapshot
  deletion_protection     = var.deletion_protection

  tags = merge(var.tags, { Name = "${var.name}-aurora" })
}

resource "aws_rds_cluster_instance" "this" {
  count              = var.instance_count
  identifier         = "${var.name}-aurora-${count.index}"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = var.instance_class
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version

  tags = merge(var.tags, { Name = "${var.name}-aurora-instance-${count.index}" })
}
