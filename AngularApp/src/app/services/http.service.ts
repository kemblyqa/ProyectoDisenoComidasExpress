import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'; 

@Injectable()
export class HttpService {
	//url develop mode
	public apiUrl:string = "http://localhost:5000/api/";
	public results:Object[];

	constructor(private http:HttpClient){}

	/*Gets the information from the endPoint requested*/
	public getService(endPoint:string) : Promise<any>{
		return this.http
		.get(`${this.apiUrl}${endPoint}`)
		.toPromise()
		.then(this.extractData)
		.catch(this.handleError)
    }
    /*Gets the information from the endPoint requested*/
	public getServiceParams(endPoint:string, params:any) : Promise<any>{
		return this.http
		.get(`${this.apiUrl}${endPoint}`,{params: {params}})
		.toPromise()
		.then(this.extractData)
		.catch(this.handleError)
	}
	/*Inserts information through an endPoint*/
	public postService(body:any,endPoint:string) : Promise<any>{
		return this.http
        .post(`${this.apiUrl}${endPoint}`,body)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
	}
	/*Overwrite existence information with new one*/
	public putService(body:any,endPoint:string) : Promise<any>{
		return this.http
        .put(`${this.apiUrl}${endPoint}`,body)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
	} 
	/*Removes data from the DB when endPoint is called*/
	public deleteService(params:any,endPoint:string) : Promise<any>{
		return this.http
        .delete(`${this.apiUrl}${endPoint}`,{params})
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
	}
	/*Insert the extracted data into the array and returns the results*/
	private extractData(response : Response){
		return response;
	}
	/*Returns the error message in case of existence*/
	private handleError(error:any) : Promise<any>{
		console.log("Error Ocurred: ",error);
		return Promise.reject(error.message || error);
	}
}