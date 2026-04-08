import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useManufacturers, useDeleteManufacturer } from '@/hooks/manufacturer/useManufacturerQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { Manufacturer } from '@/types/manufacturer';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2
} from 'lucide-react';

export const ManufacturerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturerToDelete, setManufacturerToDelete] = useState<Manufacturer | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const deleteManufacturer = useDeleteManufacturer();

  const { data: response, isLoading, error } = useManufacturers();

  // Filter manufacturers based on search term
  const filteredManufacturers = useMemo(() => {
    if (!response?.results) return [];
    
    if (!debouncedSearchTerm) {
      return response.results;
    }
    
    return response.results.filter((manufacturer) =>
      manufacturer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [response?.results, debouncedSearchTerm]);

  const handleDelete = async (manufacturer: Manufacturer) => {
    try {
      await deleteManufacturer.mutateAsync(manufacturer.id.toString());
      setManufacturerToDelete(null);
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading manufacturers. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manufacturers</h1>
        <Button onClick={() => navigate('/dashboard/asset/inventory-reference/manufacturers/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Manufacturer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Manufacturers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search manufacturers by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading manufacturers...</p>
                  </TableCell>
                </TableRow>
              ) : filteredManufacturers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-gray-500">No manufacturers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredManufacturers.map((manufacturer) => (
                  <TableRow key={manufacturer.id}>
                    <TableCell>{manufacturer.id}</TableCell>
                    <TableCell className="font-medium">{manufacturer.name}</TableCell>
                    <TableCell>
                      <Badge variant={manufacturer.is_active ? "default" : "secondary"}>
                        {manufacturer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/asset/inventory-reference/manufacturers/${manufacturer.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/asset/inventory-reference/manufacturers/${manufacturer.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setManufacturerToDelete(manufacturer)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              manufacturer "{manufacturer.name}" and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(manufacturer)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Display total count */}
      {response && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">
              Showing {filteredManufacturers.length} of {response.count} manufacturers
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 