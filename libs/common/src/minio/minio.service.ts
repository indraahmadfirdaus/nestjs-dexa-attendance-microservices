import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket "${this.bucketName}" created successfully`);

        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
        this.logger.log(`Bucket policy set to public read`);
      } else {
        this.logger.log(`Bucket "${this.bucketName}" already exists`);
      }
    } catch (error) {
      this.logger.error('Error initializing MinIO:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${randomUUID()}.${fileExtension}`;

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const url = await this.getFileUrl(fileName);

      this.logger.log(`File uploaded: ${fileName}`);
      return url;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = this.configService.get<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      if (fileName.includes(this.bucketName)) {
        const parts = fileName.split(`${this.bucketName}/`);
        fileName = parts[parts.length - 1];
      }

      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  extractFileName(url: string): string {
    if (url.includes(this.bucketName)) {
      const parts = url.split(`${this.bucketName}/`);
      return parts[parts.length - 1];
    }
    return url;
  }
}